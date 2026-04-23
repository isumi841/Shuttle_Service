// Model/BusSeatAvailability.js
const mongoose = require("mongoose");

const busSeatAvailabilitySchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      index: true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },
    travelDate: {
      type: Date,
      required: true
    },
    departureTime: {
      type: String,
      required: true
    },
    totalSeats: {
      type: Number,
      required: true
    },
    bookedSeats: [{
      type: Number,
      default: []
    }],
    pendingSeats: [{
      type: Number,
      default: []
    }],
    availableSeats: [{
      type: Number,
      default: []
    }]
  },
  {
    timestamps: true
  }
);

// Compound index for quick lookups
busSeatAvailabilitySchema.index({ busNumber: 1, travelDate: 1, departureTime: 1 });
busSeatAvailabilitySchema.index({ routeId: 1, travelDate: 1 });

module.exports = mongoose.model("BusSeatAvailability", busSeatAvailabilitySchema);