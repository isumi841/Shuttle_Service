const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRegister = (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2) {
    errors.push({
      field: "firstName",
      message: "First name must be at least 2 characters long",
    });
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push({
      field: "lastName",
      message: "Last name must be at least 2 characters long",
    });
  }

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Please provide a valid email" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  }

  if (!phoneNumber) {
    errors.push({ field: "phoneNumber", message: "Phone number is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Please provide a valid email" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    });
  }

  if (!newPassword) {
    errors.push({ field: "newPassword", message: "New password is required" });
  } else if (newPassword.length < 8) {
    errors.push({
      field: "newPassword",
      message: "New password must be at least 8 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, phoneNumber } = req.body;
  const errors = [];

  if (firstName && firstName.trim().length < 2) {
    errors.push({
      field: "firstName",
      message: "First name must be at least 2 characters long",
    });
  }

  if (lastName && lastName.trim().length < 2) {
    errors.push({
      field: "lastName",
      message: "Last name must be at least 2 characters long",
    });
  }

  if (phoneNumber && phoneNumber.trim().length < 10) {
    errors.push({
      field: "phoneNumber",
      message: "Phone number must be at least 10 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validateAdminUpdate = (req, res, next) => {
  next();
};

const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Please provide a valid email" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validatePasswordReset = (req, res, next) => {
  const { password } = req.body;
  const errors = [];

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validateBulkUpdate = (req, res, next) => {
  const { userIds, updateData } = req.body;
  const errors = [];

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    errors.push({ field: "userIds", message: "User IDs array is required" });
  }

  if (!updateData || typeof updateData !== "object") {
    errors.push({ field: "updateData", message: "Update data is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

const validateRoleChange = (req, res, next) => {
  const { role } = req.body;
  const errors = [];
  const validRoles = ["admin", "driver", "passenger", "support"];

  if (!role) {
    errors.push({ field: "role", message: "Role is required" });
  } else if (!validRoles.includes(role)) {
    errors.push({ field: "role", message: "Invalid role specified" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateAdminUpdate,
  validateEmail,
  validatePasswordReset,
  validateBulkUpdate,
  validateRoleChange,
};
