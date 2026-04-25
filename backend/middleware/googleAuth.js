const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const UmUserModel = require("../models/UmUserModel");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (credential) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error("Invalid Google token");
  }
};

const googleAuth = asyncHandler(async (req, res, next) => {
  const { credential, userData } = req.body;

  if (!credential) {
    return next(new ErrorResponse("Google credential is required", 400));
  }

  try {
    const googleUser = await verifyGoogleToken(credential);

    let user = await UmUserModel.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        user.isVerified = true;
        await user.save();
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture || googleUser.picture,
        },
      });
    } else {
      if (!userData) {
        return res.status(202).json({
          success: true,
          requiresAdditionalInfo: true,
          googleUser: {
            email: googleUser.email,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            profilePicture: googleUser.picture,
            googleId: googleUser.sub,
          },
        });
      }

      const newUser = new UmUserModel({
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        email: googleUser.email,
        googleId: googleUser.sub,
        isVerified: true,
        profilePicture: googleUser.picture,
        role: userData.role || "passenger",
        phoneNumber: userData.phoneNumber,
        country: userData.country || "Sri Lanka",
        address: {
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
          country: userData.country || "Sri Lanka",
        },

        ...(userData.role === "driver" && {
          licenseNumber: userData.licenseNumber,
          licenseExpiry: userData.licenseExpiry,
          vehicleNumber: userData.vehicleNumber,
          yearsOfExperience: userData.yearsOfExperience,
          emergencyContact: userData.emergencyContact,
        }),
      });

      await newUser.save();

      const token = generateToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);

      newUser.refreshToken = refreshToken;
      await newUser.save();

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        refreshToken,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
          profilePicture: newUser.profilePicture,
        },
      });
    }
  } catch (error) {
    return next(new ErrorResponse("Google authentication failed", 400));
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

module.exports = {
  googleAuth,
  verifyGoogleToken,
};
