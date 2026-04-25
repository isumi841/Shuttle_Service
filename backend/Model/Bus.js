const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, "Bus number is required"],
      unique: true,
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [20, "Minimum seats is 20"],
      max: [60, "Maximum seats is 60"],
    },
    driver: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
    capacity: {
      type: Number,
    },
    lastMaintenance: {
      type: Date,
    },
    fuelEfficiency: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);