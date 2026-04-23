// Route/bookingRoutes.js - Add seat availability route
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingsByRouteAndDate,
  getPendingRequests,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getDashboardStats,
  getSeatAvailability  // Import the new function
} = require('../controllers/bookingController');

// Dashboard statistics (must be before dynamic routes)
router.get('/dashboard/stats', getDashboardStats);

// Get seat availability for a bus
router.get('/availability/:busNumber', getSeatAvailability);

// Get bookings by route and date
router.get('/route/:routeId', getBookingsByRouteAndDate);

// Get pending requests
router.get('/pending', getPendingRequests);

// Confirm booking (Admin)
router.put('/:id/confirm', confirmBooking);

// Reject booking (Admin)
router.put('/:id/reject', rejectBooking);

// Cancel booking (Student)
router.put('/:id/cancel', cancelBooking);

// Main routes
router.route('/')
  .get(getBookings)
  .post(createBooking);

// Get single booking
router.get('/:id', getBookingById);

module.exports = router;