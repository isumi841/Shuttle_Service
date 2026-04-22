const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    stops: {
      type: [String],
      required: [true, "At least 2 stops are required"],
    },
    departure: {
      type: String,
      required: [true, "Departure time is required"],
    },
    arrival: {
      type: String,
      required: [true, "Arrival time is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    distance: {
      type: String,
      required: [true, "Distance is required"],
    },
    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
    },
    assignedBus: {
      type: String,
      required: [true, "Assigned bus is required"],
    },
    scheduleDays: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    trips: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Route", routeSchema);