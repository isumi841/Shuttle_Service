// Model/Booking.js - Add seatStatus field
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },
    routeName: {
      type: String,
      required: true
    },
    busNumber: {
      type: String,
      required: true
    },
    seatNumber: {
      type: Number,
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
    arrivalTime: {
      type: String
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    studentPhone: {
      type: String,
      required: true
    },
    studentId: {
      type: String,
      required: true,
      uppercase: true
    },
    ticketPrice: {
      type: Number,
      required: true
    },
    paymentSlip: {
      type: String,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rejected"],
      default: "pending"
    },
    seatStatus: {
      type: String,
      enum: ["available", "booked", "pending"],
      default: "pending"
    },
    approvedBy: {
      type: String,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingReference = `SLIIT-${year}${month}${day}-${random}`;
  }

});

// Add indexes
bookingSchema.index({ studentEmail: 1, travelDate: 1 });
bookingSchema.index({ routeId: 1, travelDate: 1, seatNumber: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ routeId: 1, travelDate: 1, status: 1 });
bookingSchema.index({ busNumber: 1, travelDate: 1, seatNumber: 1 });

module.exports = mongoose.model("Booking", bookingSchema);