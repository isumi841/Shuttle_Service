import { apiService, handleApiError } from "./api";

class AdminService {
  async uploadProfilePicture(file, progressCallback) {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await apiService.post(
        "/users/profile/upload-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressCallback) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              progressCallback(percentCompleted);
            }
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          data: {
            profilePicture: response.data.data.profilePicture,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Upload failed",
        };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async deleteProfilePicture() {
    try {
      const response = await apiService.delete("/users/profile/picture");

      if (response.data.success) {
        return {
          success: true,
          message:
            response.data.message || "Profile picture deleted successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to delete profile picture",
        };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async deleteAccount({ password, reason }) {
    try {
      const response = await apiService.delete("/users/account", {
        data: { password, reason },
      });

      if (response.data.success) {
        this.clearSession();
        return {
          success: true,
          message: response.data.message || "Account deleted successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to delete account",
        };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async getProfile() {
    try {
      const response = await apiService.get("/users/profile");

      if (response.data.success) {
        const userData = this.mapUserData(response.data.data);
        this.updateStoredUserInfo(userData);

        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to fetch profile",
        };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async updateProfile(updateData) {
    try {
      console.log("Sending updateData:", updateData);
      const response = await apiService.put("/users/profile", updateData);
      console.log("Full API response:", response);

      // Check if response indicates success (handle both expected formats)
      const isSuccess =
        response.data.success === true ||
        (response.data.msg &&
          response.data.msg.toLowerCase().includes("successfully"));

      if (isSuccess) {
        // Use response.data.data or response.data.user depending on response structure
        const userData = this.mapUserData(
          response.data.data || response.data.user
        );
        this.updateStoredUserInfo(userData);

        return {
          success: true,
          data: response.data.data || response.data.user,
          message:
            response.data.message ||
            response.data.msg ||
            "Profile updated successfully",
        };
      } else {
        console.log("❌ Update failed:", response.data);
        return {
          success: false,
          message:
            response.data.message ||
            response.data.msg ||
            "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const requestData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      const response = await apiService.put(
        "/users/change-password",
        requestData
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        return {
          success: true,
          message: response.data.message || "Password changed successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to change password",
        };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      return {
        success: false,
        message: errorInfo.message,
      };
    }
  }

  async logout() {
    try {
      await apiService.post("/users/logout");
      this.clearSession();
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      this.clearSession();
      return { success: true };
    }
  }

  getStoredAdminInfo() {
    try {
      const userInfo = localStorage.getItem("userInfo");

      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return {
          success: true,
          data: parsed,
        };
      } else {
        return {
          success: false,
          message: "No stored user information found",
        };
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error reading stored user information",
      };
    }
  }

  updateStoredUserInfo(userData) {
    try {
      if (userData) {
        const existingData = this.getStoredAdminInfo();
        const mergedData = existingData.success
          ? { ...existingData.data, ...userData }
          : userData;

        localStorage.setItem("userInfo", JSON.stringify(mergedData));

        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  formatRole(role) {
    if (!role) return "Administrator";

    const roleMap = {
      admin: "Super Administrator",
      support: "Support Administrator",
      driver: "Driver",
      passenger: "Passenger",
    };

    return (
      roleMap[role.toLowerCase()] ||
      role.charAt(0).toUpperCase() + role.slice(1)
    );
  }

  getDepartmentFromRole(role) {
    if (!role) return "System Operations";

    const departmentMap = {
      admin: "System Operations",
      support: "Customer Support",
      driver: "Transportation",
      passenger: "Customer Services",
    };

    return departmentMap[role.toLowerCase()] || "System Operations";
  }

  getPermissionsFromRole(role) {
    if (!role) return [];

    const permissionMap = {
      admin: [
        "User Management",
        "System Configuration",
        "Analytics & Reports",
        "Route Planning",
        "Fleet Management",
        "Security Management",
      ],
      support: [
        "User Support",
        "View Reports",
        "Customer Service",
        "Issue Management",
      ],
      driver: ["Route Management", "Vehicle Updates", "Trip Reports"],
      passenger: ["Booking Management", "Profile Updates"],
    };

    return permissionMap[role.toLowerCase()] || [];
  }

  isAdmin() {
    try {
      const userInfo = this.getStoredAdminInfo();
      if (userInfo.success) {
        return userInfo.data.role === "admin";
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  getCurrentUserId() {
    try {
      const userInfo = this.getStoredAdminInfo();
      if (userInfo.success) {
        return userInfo.data._id || userInfo.data.id;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  }

  clearSession() {
    try {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  formatMongoDate(mongoDate) {
    if (!mongoDate) return null;

    try {
      if (mongoDate.$date) {
        if (mongoDate.$date.$numberLong) {
          return new Date(parseInt(mongoDate.$date.$numberLong)).toISOString();
        }
        return new Date(mongoDate.$date).toISOString();
      }

      return new Date(mongoDate).toISOString();
    } catch (error) {
      console.error("Error formatting MongoDB date:", error);
      return null;
    }
  }

  extractObjectId(mongoId) {
    if (!mongoId) return "";

    if (typeof mongoId === "string") return mongoId;
    if (mongoId.$oid) return mongoId.$oid;
    if (mongoId._id) return mongoId._id;

    return mongoId.toString();
  }

  mapUserData(backendUser) {
    if (!backendUser) return null;

    const mappedData = {
      id: this.extractObjectId(backendUser._id),
      _id: this.extractObjectId(backendUser._id),

      firstName: backendUser.firstName || "",
      lastName: backendUser.lastName || "",
      email: backendUser.email || "",
      phoneNumber: backendUser.phoneNumber || "",
      phone: backendUser.phoneNumber || backendUser.phone || "",

      role: backendUser.role || "admin",
      isActive:
        backendUser.isActive !== undefined ? backendUser.isActive : true,
      isVerified:
        backendUser.isVerified !== undefined ? backendUser.isVerified : false,

      dateOfBirth: backendUser.dateOfBirth || null,
      gender: backendUser.gender || "",

      address: this.normalizeAddress(backendUser.address),
      country:
        backendUser.country || backendUser.address?.country || "Sri Lanka",

      licenseNumber: backendUser.licenseNumber || "",
      licenseExpiry: backendUser.licenseExpiry || null,

      preferences: backendUser.preferences || {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        language: "en",
        currency: "LKR",
      },

      totalBookings: backendUser.totalBookings || 0,
      totalSpent: backendUser.totalSpent || 0,
      loginAttempts: backendUser.loginAttempts || 0,

      profilePicture: backendUser.profilePicture || null,
      profileImage:
        backendUser.profilePicture || backendUser.profileImage || null,

      createdAt: this.formatMongoDate(backendUser.createdAt),
      updatedAt: this.formatMongoDate(backendUser.updatedAt),
      lastLogin: this.formatMongoDate(backendUser.lastLogin),
      joinDate: this.formatMongoDate(backendUser.createdAt),
    };

    return mappedData;
  }

  normalizeAddress(address) {
    if (!address) {
      return {
        city: "",
        state: "",
        zipCode: "",
        country: "Sri Lanka",
      };
    }

    if (typeof address === "string") {
      return {
        city: address,
        state: "",
        zipCode: "",
        country: "Sri Lanka",
      };
    }

    return {
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "Sri Lanka",
    };
  }

  async getCompleteProfile() {
    try {
      const apiResponse = await this.getProfile();

      if (apiResponse.success) {
        return apiResponse;
      }

      const storedInfo = this.getStoredAdminInfo();
      if (storedInfo.success) {
        return storedInfo;
      }

      return {
        success: false,
        data: null,
      };
    } catch (error) {
      console.error("Error getting complete profile:", error);

      const storedInfo = this.getStoredAdminInfo();
      return storedInfo.success ? storedInfo : { success: false, data: null };
    }
  }
}

const adminService = new AdminService();
export default adminService;
