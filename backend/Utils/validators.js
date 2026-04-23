const validateBusNumber = (busNumber) => {
  const busNumberRegex = /^NB-\d{4}$/;
  if (!busNumber) return "Bus number is required";
  if (!busNumberRegex.test(busNumber)) return "Bus number must be in format NB-XXXX (e.g., NB-4123)";
  return null;
};

const validateSeats = (seats) => {
  if (!seats) return "Number of seats is required";
  const numSeats = parseInt(seats);
  if (isNaN(numSeats)) return "Please enter a valid number";
  if (numSeats < 20) return "Minimum seats is 20";
  if (numSeats > 60) return "Maximum seats is 60";
  return null;
};

const validateDriverName = (name) => {
  if (!name) return "Driver name is required";
  if (name.trim().length < 3) return "Driver name must be at least 3 characters";
  if (name.trim().length > 50) return "Driver name must be less than 50 characters";
  if (!/^[a-zA-Z\s.]+$/.test(name)) return "Driver name can only contain letters, spaces, and dots";
  return null;
};

const validateContact = (contact) => {
  if (!contact) return "Contact number is required";
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(contact)) return "Contact must be a 10-digit Sri Lankan number starting with 0 (e.g., 0771234567)";
  return null;
};

const validateMaintenanceDate = (date) => {
  if (!date) return null;
  const maintDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (maintDate > today) return "Maintenance date cannot be in the future";
  return null;
};

const validateFuelEfficiency = (efficiency) => {
  if (!efficiency) return null;
  const match = efficiency.match(/^(\d+(?:\.\d+)?)\s*km\/L$/i);
  if (!match) return 'Fuel efficiency must be in format like "8.5 km/L"';
  const value = parseFloat(match[1]);
  if (value < 5) return "Fuel efficiency too low (minimum 5 km/L)";
  if (value > 15) return "Fuel efficiency too high (maximum 15 km/L)";
  return null;
};

const validateCapacity = (capacity, seats) => {
  if (!capacity) return null;
  const numCapacity = parseInt(capacity);
  if (isNaN(numCapacity)) return "Please enter a valid number";
  if (numCapacity < 20) return "Minimum capacity is 20";
  if (numCapacity > 60) return "Maximum capacity is 60";
  if (seats && numCapacity < parseInt(seats)) return "Capacity cannot be less than number of seats";
  return null;
};

const validateTime = (timeStr) => {
  if (!timeStr) return "Time is required";
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/;
  if (!timeRegex.test(timeStr)) return "Invalid time format. Use HH:MM AM/PM";
  return null;
};

const validateDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return "Both start and end dates are required";
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) {
    return "Start date cannot be in the past";
  }
  if (end <= start) {
    return "End date must be after start date";
  }
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff < 7) {
    return "Route validity should be at least 7 days";
  }
  if (daysDiff > 365) {
    return "Route validity cannot exceed 365 days";
  }
  return null;
};

module.exports = {
  validateBusNumber,
  validateSeats,
  validateDriverName,
  validateContact,
  validateMaintenanceDate,
  validateFuelEfficiency,
  validateCapacity,
  validateTime,
  validateDates,
};