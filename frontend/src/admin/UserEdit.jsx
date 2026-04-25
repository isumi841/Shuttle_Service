import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Crown,
  Eye,
  EyeOff,
  HeadphonesIcon,
  Key,
  RefreshCw,
  Save,
  Shield,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserService } from "../services/UserService";

const UserEdit = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "passenger",
    isActive: true,

    dateOfBirth: "",
    gender: "",
    country: "Sri Lanka",

    address: {
      city: "",
      state: "",
      zipCode: "",
      country: "Sri Lanka",
    },

    licenseNumber: "",
    licenseExpiry: "",
    vehicleNumber: "",
    yearsOfExperience: "",
    emergencyContact: "",

    currentRoute: "",
    employmentStatus: "",
    shiftPreference: "",
    salary: "",
    specialQualifications: "",

    medicalCertificateExpiry: "",
    bloodType: "",
    medicalConditions: "",

    weeklySchedule: {
      monday: { startTime: "", endTime: "", route: "", isWorking: false },
      tuesday: { startTime: "", endTime: "", route: "", isWorking: false },
      wednesday: { startTime: "", endTime: "", route: "", isWorking: false },
      thursday: { startTime: "", endTime: "", route: "", isWorking: false },
      friday: { startTime: "", endTime: "", route: "", isWorking: false },
      saturday: { startTime: "", endTime: "", route: "", isWorking: false },
      sunday: { startTime: "", endTime: "", route: "", isWorking: false },
    },
    preferredRoutes: [],
    maximumWorkingHours: 8,
    availableForOvertime: false,

    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      language: "en",
      currency: "LKR",
    },
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const availableRoutes = [
    "Route 1 - Colombo to Kandy",
    "Route 2 - Kandy to Galle",
    "Route 3 - Colombo to Galle",
    "Route 4 - Colombo to Jaffna",
    "Route 5 - Kandy to Anuradhapura",
    "Express Route A",
    "Express Route B",
    "Local Route 1",
    "Local Route 2",
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const experienceOptions = ["0-1", "1-3", "3-5", "5-10", "10+"];
  const employmentStatuses = [
    "full-time",
    "part-time",
    "contract",
    "temporary",
  ];
  const shiftPreferences = ["morning", "afternoon", "night", "flexible"];

  // Add these validation functions after the existing ones in your component

  const validateCountry = (country) => {
    if (!country || !country.trim()) return false;
    const trimmedCountry = country.trim();

    // Check length
    if (trimmedCountry.length < 2 || trimmedCountry.length > 100) return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedCountry);
  };

  const validateCity = (city) => {
    if (!city || !city.trim()) return false;
    const trimmedCity = city.trim();

    // Check length
    if (trimmedCity.length < 2 || trimmedCity.length > 100) return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedCity);
  };

  const validateState = (state) => {
    if (!state || !state.trim()) return false;
    const trimmedState = state.trim();

    // Check length
    if (trimmedState.length < 2 || trimmedState.length > 100) return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedState);
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return false;
    const trimmedEmail = email.trim();

    // Length check
    if (trimmedEmail.length > 254) return false;

    // Basic format check
    const emailRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,63})?@[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253})?[a-zA-Z0-9]\.[a-zA-Z]{2,63}$/;
    if (!emailRegex.test(trimmedEmail)) return false;

    const [localPart, domain] = trimmedEmail.split("@");

    // Check for invalid patterns
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
    if (localPart.includes("..") || domain.includes("..")) return false;

    // Validate TLD contains only letters
    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-zA-Z]{2,63}$/.test(tld)) return false;

    return true;
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) return false;

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const sriLankaRegex = /^(0[0-9]{9}|\+94[0-9]{9})$/;

    if (!sriLankaRegex.test(cleanPhone)) {
      return false;
    }

    if (cleanPhone.startsWith("0")) {
      return cleanPhone.startsWith("07") || cleanPhone.startsWith("011");
    }

    if (cleanPhone.startsWith("+94")) {
      const withoutCode = cleanPhone.substring(3);
      return withoutCode.startsWith("7") || withoutCode.startsWith("11");
    }

    return false;
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return false;
    const trimmedName = name.trim();

    // Check length
    if (trimmedName.length < 2 || trimmedName.length > 50) return false;

    // Only allow letters, spaces, hyphens, and apostrophes
    return /^[a-zA-Z\s'-]+$/.test(trimmedName);
  };

  const validateZipCode = (code) => {
    if (!code || !code.trim()) return false;
    const trimmedCode = code.trim();

    // Must be exactly 5 digits
    if (!/^\d{5}$/.test(trimmedCode)) return false;

    // Cannot be 00000
    if (trimmedCode === "00000") return false;

    return true;
  };

  const validateLicenseNumber = (license) => {
    if (!license || !license.trim()) return false;
    const licenseClean = license.trim().toUpperCase();
    return /^[A-Z][0-9]{7}$/.test(licenseClean);
  };

  const validateVehicleNumber = (vehicle) => {
    if (!vehicle || !vehicle.trim()) return false;
    const vehicleClean = vehicle.trim().toUpperCase();
    return /^([A-Z]{2,3}-\d{4}|[A-Z]{2}\s[A-Z]{2,3}-\d{4}|SHUTTLE-\d{3,4})$/i.test(
      vehicleClean
    );
  };

  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const maxLength = password.length <= 128;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+=[\]\\/`~;'-]/.test(password);

    return {
      isValid:
        minLength &&
        maxLength &&
        hasUpper &&
        hasLower &&
        hasNumber &&
        hasSpecial,
      errors: {
        minLength,
        maxLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
      },
    };
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return true; // Optional field

    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Must be at least 18 years old for drivers, 16 for others
    return age >= 16;
  };

  const validateLicenseExpiry = (expiryDate) => {
    if (!expiryDate)
      return { valid: false, error: "License expiry date is required" };

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (expiry <= today) {
      return {
        valid: false,
        error: "License expiry date must be in the future",
      };
    }

    if (daysDiff <= 30) {
      return {
        valid: false,
        error: "License expires within 30 days - please renew before updating",
      };
    }

    if (daysDiff > 3650) {
      // 10 years
      return {
        valid: false,
        error: "License expiry date seems invalid (too far in future)",
      };
    }

    return { valid: true };
  };

  const validateMedicalCertificateExpiry = (expiryDate) => {
    if (!expiryDate) return { valid: true }; // Optional

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      return { valid: false, error: "Medical certificate has expired" };
    }

    const daysDiff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1825) {
      // 5 years
      return {
        valid: false,
        error: "Medical certificate expiry date seems invalid",
      };
    }

    return { valid: true };
  };

  const validateSalary = (salary) => {
    if (!salary) return true; // Optional

    const salaryNum = parseFloat(salary);

    // Must be a positive number
    if (isNaN(salaryNum) || salaryNum < 0) return false;

    // Reasonable salary range (1000 - 10,000,000 LKR)
    if (salaryNum < 1000 || salaryNum > 10000000) return false;

    return true;
  };

  const validateWorkingHours = (hours) => {
    const hoursNum = parseInt(hours);

    // Must be between 6 and 12 hours
    if (isNaN(hoursNum) || hoursNum < 6 || hoursNum > 12) return false;

    return true;
  };

  const validateScheduleTime = (startTime, endTime) => {
    if (!startTime || !endTime) return { valid: true }; // Optional if not working

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // End time must be after start time
    if (endMinutes <= startMinutes) {
      return { valid: false, error: "End time must be after start time" };
    }

    // Shift must be at least 4 hours and max 12 hours
    const duration = (endMinutes - startMinutes) / 60;
    if (duration < 4) {
      return { valid: false, error: "Shift must be at least 4 hours" };
    }
    if (duration > 12) {
      return { valid: false, error: "Shift cannot exceed 12 hours" };
    }

    return { valid: true };
  };

  // COMPLETE VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    // ===== BASIC INFORMATION VALIDATIONS =====

    // First Name validation
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName =
        "First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes";
    }

    // Last Name validation
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName =
        "Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes";
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)";
    }

    // Role validation
    const validRoles = ["admin", "support", "driver", "passenger"];
    if (!validRoles.includes(formData.role)) {
      newErrors.role = "Please select a valid user role";
    }

    // Date of Birth validation
    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "User must be at least 16 years old";
    }

    // Gender validation
    if (formData.gender && !["male", "female"].includes(formData.gender)) {
      newErrors.gender = "Please select a valid gender";
    }

    // ===== ADDRESS VALIDATIONS (ALL REQUIRED) =====

    // Country validation
    if (!formData.address.country || !formData.address.country.trim()) {
      newErrors.country = "Country is required";
    } else if (!validateCountry(formData.address.country)) {
      newErrors.country =
        "Country must be 2-100 characters and contain only letters, spaces, and basic punctuation (no numbers)";
    }

    // City validation
    if (!formData.address.city || !formData.address.city.trim()) {
      newErrors.city = "City is required";
    } else if (!validateCity(formData.address.city)) {
      newErrors.city =
        "City must be 2-100 characters and contain only letters, spaces, and basic punctuation (no numbers)";
    }

    // State validation
    if (!formData.address.state || !formData.address.state.trim()) {
      newErrors.state = "State/Province is required";
    } else if (!validateState(formData.address.state)) {
      newErrors.state =
        "State/Province must be 2-100 characters and contain only letters, spaces, and basic punctuation (no numbers)";
    }

    // Zip code validation
    if (!formData.address.zipCode || !formData.address.zipCode.trim()) {
      newErrors.zipCode = "Postal code is required";
    } else if (!validateZipCode(formData.address.zipCode)) {
      newErrors.zipCode =
        "Sri Lankan postal code must be exactly 5 digits and cannot be 00000";
    }

    // ===== DRIVER-SPECIFIC VALIDATIONS =====

    if (formData.role === "driver") {
      // License Number validation
      if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
        newErrors.licenseNumber = "License number is required for drivers";
      } else if (!validateLicenseNumber(formData.licenseNumber)) {
        newErrors.licenseNumber =
          "License must be in format: One letter followed by 7 digits (e.g., B1234567)";
      }

      // License Expiry validation
      const licenseValidation = validateLicenseExpiry(formData.licenseExpiry);
      if (!licenseValidation.valid) {
        newErrors.licenseExpiry = licenseValidation.error;
      }

      // Vehicle Number validation
      if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
        newErrors.vehicleNumber = "Vehicle number is required for drivers";
      } else if (!validateVehicleNumber(formData.vehicleNumber)) {
        newErrors.vehicleNumber =
          "Invalid vehicle number format. Examples: WP CAB-1234, ABC-1234, or SHUTTLE-101";
      }

      // Years of Experience validation
      if (!formData.yearsOfExperience) {
        newErrors.yearsOfExperience =
          "Years of experience is required for drivers";
      } else {
        const validExperience = ["0-1", "1-3", "3-5", "5-10", "10+"];
        if (!validExperience.includes(formData.yearsOfExperience)) {
          newErrors.yearsOfExperience =
            "Please select a valid experience range";
        }
      }

      // Emergency Contact validation
      if (!formData.emergencyContact || !formData.emergencyContact.trim()) {
        newErrors.emergencyContact =
          "Emergency contact is required for drivers";
      } else {
        const emergencyClean = formData.emergencyContact.replace(
          /[\s\-()]/g,
          ""
        );
        const phoneClean = formData.phoneNumber?.replace(/[\s\-()]/g, "") || "";

        if (!validatePhone(formData.emergencyContact)) {
          newErrors.emergencyContact =
            "Please enter a valid Sri Lankan phone number";
        } else if (emergencyClean === phoneClean) {
          newErrors.emergencyContact =
            "Emergency contact must be different from main phone number";
        }
      }

      // Employment Status validation
      if (formData.employmentStatus) {
        const validStatuses = [
          "full-time",
          "part-time",
          "contract",
          "temporary",
        ];
        if (!validStatuses.includes(formData.employmentStatus)) {
          newErrors.employmentStatus =
            "Please select a valid employment status";
        }
      }

      // Shift Preference validation
      if (formData.shiftPreference) {
        const validShifts = ["morning", "afternoon", "night", "flexible"];
        if (!validShifts.includes(formData.shiftPreference)) {
          newErrors.shiftPreference = "Please select a valid shift preference";
        }
      }

      // Salary validation
      if (formData.salary && !validateSalary(formData.salary)) {
        newErrors.salary =
          "Salary must be a positive number between 1,000 and 10,000,000 LKR";
      }

      // Maximum Working Hours validation
      if (
        formData.maximumWorkingHours &&
        !validateWorkingHours(formData.maximumWorkingHours)
      ) {
        newErrors.maximumWorkingHours =
          "Maximum working hours must be between 6 and 12 hours";
      }

      // Medical Certificate Expiry validation
      if (formData.medicalCertificateExpiry) {
        const medicalValidation = validateMedicalCertificateExpiry(
          formData.medicalCertificateExpiry
        );
        if (!medicalValidation.valid) {
          newErrors.medicalCertificateExpiry = medicalValidation.error;
        }
      }

      // Blood Type validation
      if (formData.bloodType) {
        const validBloodTypes = [
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ];
        if (!validBloodTypes.includes(formData.bloodType)) {
          newErrors.bloodType = "Please select a valid blood type";
        }
      }

      // Medical Conditions validation (length check)
      if (
        formData.medicalConditions &&
        formData.medicalConditions.length > 500
      ) {
        newErrors.medicalConditions =
          "Medical conditions description cannot exceed 500 characters";
      }

      // Special Qualifications validation (length check)
      if (
        formData.specialQualifications &&
        formData.specialQualifications.length > 500
      ) {
        newErrors.specialQualifications =
          "Special qualifications description cannot exceed 500 characters";
      }

      // Weekly Schedule validations
      if (formData.weeklySchedule) {
        Object.entries(formData.weeklySchedule).forEach(([day, schedule]) => {
          if (schedule.isWorking) {
            if (!schedule.startTime) {
              newErrors[`schedule_${day}_start`] = `${
                day.charAt(0).toUpperCase() + day.slice(1)
              } start time is required`;
            }
            if (!schedule.endTime) {
              newErrors[`schedule_${day}_end`] = `${
                day.charAt(0).toUpperCase() + day.slice(1)
              } end time is required`;
            }

            if (schedule.startTime && schedule.endTime) {
              const timeValidation = validateScheduleTime(
                schedule.startTime,
                schedule.endTime
              );
              if (!timeValidation.valid) {
                newErrors[`schedule_${day}`] = `${
                  day.charAt(0).toUpperCase() + day.slice(1)
                }: ${timeValidation.error}`;
              }
            }
          }
        });
      }

      // Preferred Routes validation
      if (formData.preferredRoutes && formData.preferredRoutes.length > 10) {
        newErrors.preferredRoutes = "Cannot have more than 10 preferred routes";
      }
    }

    // ===== PREFERENCES VALIDATIONS =====

    // Language validation
    if (formData.preferences?.language) {
      const validLanguages = ["en", "si", "ta"];
      if (!validLanguages.includes(formData.preferences.language)) {
        newErrors.language = "Please select a valid language";
      }
    }

    // Currency validation
    if (formData.preferences?.currency) {
      const validCurrencies = ["LKR", "USD", "EUR"];
      if (!validCurrencies.includes(formData.preferences.currency)) {
        newErrors.currency = "Please select a valid currency";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else {
      const validation = validatePasswordStrength(passwordData.newPassword);
      if (!validation.isValid) {
        errors.newPassword =
          "Password must be 8+ characters with uppercase, lowercase, number, and special character";
      }
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("=== FETCHING USER DATA ===");
        console.log("User ID:", userId);

        const response = await UserService.getUserById(userId);
        console.log("=== FULL API RESPONSE ===");
        console.log("Response:", response);

        if (response.success && response.data) {
          let userData = response.data;

          if (userData.success && userData.data) {
            userData = userData.data;
          }

          console.log("=== USER DATA FROM BACKEND ===");
          console.log("Raw user data:", userData);

          const transformedData = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            role: userData.role || "passenger",
            isActive: userData.isActive !== false,

            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: userData.gender || "",
            country:
              userData.country || userData.address?.country || "Sri Lanka",

            address: {
              city: userData.address?.city || userData.city || "",
              state: userData.address?.state || userData.state || "",
              zipCode: userData.address?.zipCode || userData.zipCode || "",
              country:
                userData.address?.country || userData.country || "Sri Lanka",
            },

            licenseNumber: userData.licenseNumber || "",
            licenseExpiry: userData.licenseExpiry
              ? new Date(userData.licenseExpiry).toISOString().split("T")[0]
              : "",
            vehicleNumber: userData.vehicleNumber || "",
            yearsOfExperience: userData.yearsOfExperience || "",
            emergencyContact: userData.emergencyContact || "",

            currentRoute: userData.currentRoute || "",
            employmentStatus: userData.employmentStatus || "",
            shiftPreference: userData.shiftPreference || "",
            salary: userData.salary || "",
            specialQualifications: userData.specialQualifications || "",

            medicalCertificateExpiry: userData.medicalCertificateExpiry
              ? new Date(userData.medicalCertificateExpiry)
                  .toISOString()
                  .split("T")[0]
              : "",
            bloodType: userData.bloodType || "",
            medicalConditions: userData.medicalConditions || "",

            weeklySchedule: userData.weeklySchedule || {
              monday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              tuesday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              wednesday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              thursday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              friday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              saturday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              sunday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
            },
            preferredRoutes: userData.preferredRoutes || [],
            maximumWorkingHours: userData.maximumWorkingHours || 8,
            availableForOvertime: userData.availableForOvertime || false,

            preferences: {
              notifications: {
                email: userData.preferences?.notifications?.email !== false,
                sms: userData.preferences?.notifications?.sms !== false,
                push: userData.preferences?.notifications?.push !== false,
              },
              language: userData.preferences?.language || "en",
              currency: userData.preferences?.currency || "LKR",
            },
          };

          setFormData(transformedData);
          setOriginalData(transformedData);
        } else {
          setError("Invalid response from server");
        }
      } catch (error) {
        console.error("Error details:", error);

        if (error.response) {
          if (error.response.status === 404) {
            setError("User not found");
          } else if (error.response.status === 401) {
            setError("Unauthorized - Please login as admin");
          } else {
            setError(error.response.data?.message || "Failed to load user");
          }
        } else if (error.request) {
          setError("Cannot connect to server. Please check your connection.");
        } else {
          setError(error.message || "An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const changes = JSON.stringify(formData) !== JSON.stringify(originalData);
    setUnsavedChanges(changes);
  }, [formData, originalData]);

  const handleInputChange = (field, value) => {
    console.log(`Updating field ${field} with value:`, value);

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          [field]: field === "isWorking" ? value : value,
        },
      },
    }));
  };

  const handleRouteAdd = () => {
    const newRoute = prompt("Enter route name:");
    if (
      newRoute &&
      newRoute.trim() &&
      !formData.preferredRoutes.includes(newRoute.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        preferredRoutes: [...prev.preferredRoutes, newRoute.trim()],
      }));
    }
  };

  const handleRouteRemove = (routeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferredRoutes: prev.preferredRoutes.filter(
        (route) => route !== routeToRemove
      ),
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async () => {
    const passwordErrors = validatePassword();
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setShowSuccessMessage(true);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
        setErrors({});
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        isActive: formData.isActive,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        country: formData.country,
        address: formData.address,
        preferences: formData.preferences,
      };

      if (formData.role === "driver") {
        updateData.licenseNumber = formData.licenseNumber.trim();
        updateData.licenseExpiry = formData.licenseExpiry;
        updateData.vehicleNumber = formData.vehicleNumber.trim();
        updateData.yearsOfExperience = formData.yearsOfExperience;
        updateData.emergencyContact = formData.emergencyContact.trim();
        updateData.currentRoute = formData.currentRoute?.trim() || "";
        updateData.salary = formData.salary
          ? parseFloat(formData.salary)
          : null;
        updateData.specialQualifications =
          formData.specialQualifications?.trim() || "";
        updateData.medicalCertificateExpiry =
          formData.medicalCertificateExpiry || null;
        updateData.medicalConditions = formData.medicalConditions?.trim() || "";
        updateData.weeklySchedule = formData.weeklySchedule;
        updateData.preferredRoutes = formData.preferredRoutes;
        updateData.maximumWorkingHours = formData.maximumWorkingHours;
        updateData.availableForOvertime = formData.availableForOvertime;
      }

      const response = await UserService.updateUser(userId, updateData);

      if (response.success) {
        setShowSuccessMessage(true);
        setOriginalData(formData);
        setUnsavedChanges(false);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-5 h-5 text-purple-600" />;
      case "support":
        return <HeadphonesIcon className="w-5 h-5 text-blue-600" />;
      case "driver":
        return <Car className="w-5 h-5 text-green-600" />;
      case "passenger":
        return <Users className="w-5 h-5 text-gray-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">User ID: {userId}</p>
        </div>
      </div>
    );
  }

  if (error && !formData.firstName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Unable to load user</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/admin/userlist")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to User List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/admin/userlist`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to User List</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600">
                Update user information and settings
              </p>
            </div>
          </div>
          {unsavedChanges && (
            <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.firstName
                    ? formData.firstName.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {formData.firstName && formData.lastName
                  ? `${formData.firstName} ${formData.lastName}`
                  : formData.firstName || formData.lastName || "Unknown User"}
              </h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getRoleIcon(formData.role)}
                <span className="text-gray-600">
                  {formData.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    formData.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      formData.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || !unsavedChanges}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isSaving || !unsavedChanges
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/admin/userdetail/${userId}`)}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Success</p>
                  <p className="text-sm text-green-700 mt-1">
                    User information has been updated successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "basic", label: "Basic Information", icon: User },
                  {
                    id: "driver",
                    label: "Driver Details",
                    icon: Car,
                    condition: formData.role === "driver",
                  },
                  {
                    id: "schedule",
                    label: "Schedule & Routes",
                    icon: Calendar,
                    condition: formData.role === "driver",
                  },
                  {
                    id: "health",
                    label: "Health & Safety",
                    icon: Shield,
                    condition: formData.role === "driver",
                  },
                  { id: "security", label: "Security", icon: Key },
                ]
                  .filter((tab) => tab.condition !== false)
                  .map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
              </nav>
            </div>
          </div>

          <div className="space-y-6">
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.firstName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.lastName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phoneNumber
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.phoneNumber}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Administrator</option>
                      <option value="support">Support Staff</option>
                      <option value="driver">Driver</option>
                      <option value="passenger">Passenger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <select
                      value={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.value === "true")
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) =>
                          handleInputChange("address.country", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.country
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter country"
                        maxLength={100}
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.country}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) =>
                          handleInputChange("address.city", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.city
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter city"
                        maxLength={100}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) =>
                          handleInputChange("address.state", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.state
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter state or province"
                        maxLength={100}
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.state}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) =>
                          handleInputChange("address.zipCode", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.zipCode
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter ZIP or postal code"
                        maxLength={5}
                        pattern="[0-9]{5}"
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.zipCode}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "driver" && formData.role === "driver" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    License Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number *
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.licenseNumber
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter license number"
                      />
                      {errors.licenseNumber && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.licenseNumber}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={(e) =>
                          handleInputChange("licenseExpiry", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.licenseExpiry
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                      {errors.licenseExpiry && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.licenseExpiry}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) =>
                          handleInputChange("vehicleNumber", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.vehicleNumber
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter vehicle number"
                      />
                      {errors.vehicleNumber && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.vehicleNumber}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        value={formData.yearsOfExperience}
                        onChange={(e) =>
                          handleInputChange("yearsOfExperience", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.yearsOfExperience
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <option value="">Select experience</option>
                        {experienceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option} years
                          </option>
                        ))}
                      </select>
                      {errors.yearsOfExperience && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.yearsOfExperience}</span>
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact *
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          handleInputChange("emergencyContact", e.target.value)
                        }
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.emergencyContact
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="Enter emergency contact number"
                      />
                      {errors.emergencyContact && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.emergencyContact}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Route
                      </label>
                      <select
                        value={formData.currentRoute}
                        onChange={(e) =>
                          handleInputChange("currentRoute", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a route</option>
                        {availableRoutes.map((route) => (
                          <option key={route} value={route}>
                            {route}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Status
                      </label>
                      <select
                        value={formData.employmentStatus}
                        onChange={(e) =>
                          handleInputChange("employmentStatus", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select status</option>
                        {employmentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).replace("-", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift Preference
                      </label>
                      <select
                        value={formData.shiftPreference}
                        onChange={(e) =>
                          handleInputChange("shiftPreference", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select preference</option>
                        {shiftPreferences.map((shift) => (
                          <option key={shift} value={shift}>
                            {shift.charAt(0).toUpperCase() + shift.slice(1)}
                            {shift === "morning" && " (6AM - 2PM)"}
                            {shift === "afternoon" && " (2PM - 10PM)"}
                            {shift === "night" && " (10PM - 6AM)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary/Wage (LKR)
                      </label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) =>
                          handleInputChange("salary", e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter monthly salary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Qualifications
                      </label>
                      <textarea
                        value={formData.specialQualifications}
                        onChange={(e) =>
                          handleInputChange(
                            "specialQualifications",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any special qualifications, certifications, or training"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schedule" && formData.role === "driver" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Weekly Work Schedule
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(formData.weeklySchedule).map(
                      ([day, schedule]) => (
                        <div
                          key={day}
                          className="grid grid-cols-5 gap-4 items-center p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={schedule.isWorking}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "isWorking",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <label className="font-medium text-gray-700 capitalize">
                              {day}
                            </label>
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={schedule.route}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "route",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                              <option value="">Select route</option>
                              {availableRoutes.map((route) => (
                                <option key={route} value={route}>
                                  {route}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Work Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Working Hours per Day
                      </label>
                      <select
                        value={formData.maximumWorkingHours}
                        onChange={(e) =>
                          handleInputChange(
                            "maximumWorkingHours",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={6}>6 hours</option>
                        <option value={8}>8 hours</option>
                        <option value={10}>10 hours</option>
                        <option value={12}>12 hours</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.availableForOvertime}
                        onChange={(e) =>
                          handleInputChange(
                            "availableForOvertime",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        Available for overtime work
                      </label>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Routes
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.preferredRoutes.map((route, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {route}
                          <button
                            type="button"
                            onClick={() => handleRouteRemove(route)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleRouteAdd}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Preferred Route
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "health" && formData.role === "driver" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Health & Safety Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Certificate Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.medicalCertificateExpiry}
                      onChange={(e) =>
                        handleInputChange(
                          "medicalCertificateExpiry",
                          e.target.value
                        )
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) =>
                        handleInputChange("bloodType", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select blood type</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions/Allergies
                    </label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        handleInputChange("medicalConditions", e.target.value)
                      }
                      rows="3"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="List any medical conditions, allergies, or medications that may affect driving"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Password & Security
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPasswordSection ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Password Security
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Your new password must be at least 8 characters long
                            and include a mix of letters, numbers, and special
                            characters.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.currentPassword
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.newPassword
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.confirmPassword
                                ? "border-red-300 focus:ring-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setErrors({});
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handlePasswordSubmit}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          isSaving
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {!showPasswordSection && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Notification Preferences
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.preferences.notifications.email}
                            onChange={(e) =>
                              handleInputChange(
                                "preferences.notifications.email",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Email notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.preferences.notifications.sms}
                            onChange={(e) =>
                              handleInputChange(
                                "preferences.notifications.sms",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            SMS notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.preferences.notifications.push}
                            onChange={(e) =>
                              handleInputChange(
                                "preferences.notifications.push",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Push notifications
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Language
                        </label>
                        <select
                          value={formData.preferences.language}
                          onChange={(e) =>
                            handleInputChange(
                              "preferences.language",
                              e.target.value
                            )
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="si">Sinhala</option>
                          <option value="ta">Tamil</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency Preference
                        </label>
                        <select
                          value={formData.preferences.currency}
                          onChange={(e) =>
                            handleInputChange(
                              "preferences.currency",
                              e.target.value
                            )
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="LKR">Sri Lankan Rupee (LKR)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-md shadow-lg z-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Form has errors
              </p>
              <p className="text-sm text-red-700 mt-1">
                Please fix the highlighted fields before saving.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEdit;
