// controllers/bookingController.js - COMPLETE FILE WITH EMAIL NOTIFICATIONS
const Booking = require('../Model/Booking');
const Route = require('../Model/Route');
const Bus = require('../Model/Bus');
const Alert = require('../Model/Alert');
const BusSeatAvailability = require('../Model/BusSeatAvailability');
const { sendBookingConfirmationEmail, sendBookingRejectionEmail } = require('../services/emailService');

// Helper function to update seat availability
const updateSeatAvailability = async (busNumber, routeId, travelDate, departureTime, seatNumber, action) => {
  try {
    const startDate = new Date(travelDate);
    startDate.setHours(0, 0, 0, 0);
    
    // Get bus details for total seats
    const bus = await Bus.findOne({ busNumber });
    const totalSeats = bus ? (bus.capacity || bus.seats || 40) : 40;
    
    // Find or create seat availability record
    let seatAvailability = await BusSeatAvailability.findOne({
      busNumber,
      routeId,
      travelDate: startDate,
      departureTime
    });
    
    if (!seatAvailability) {
      seatAvailability = new BusSeatAvailability({
        busNumber,
        routeId,
        travelDate: startDate,
        departureTime,
        totalSeats,
        bookedSeats: [],
        pendingSeats: [],
        availableSeats: Array.from({ length: totalSeats }, (_, i) => i + 1)
      });
    }
    
    // Update based on action
    if (action === 'confirm') {
      seatAvailability.pendingSeats = seatAvailability.pendingSeats.filter(s => s !== seatNumber);
      if (!seatAvailability.bookedSeats.includes(seatNumber)) {
        seatAvailability.bookedSeats.push(seatNumber);
      }
      seatAvailability.availableSeats = seatAvailability.availableSeats.filter(s => s !== seatNumber);
    } 
    else if (action === 'reject') {
      seatAvailability.pendingSeats = seatAvailability.pendingSeats.filter(s => s !== seatNumber);
      if (!seatAvailability.availableSeats.includes(seatNumber)) {
        seatAvailability.availableSeats.push(seatNumber);
      }
      seatAvailability.availableSeats.sort((a, b) => a - b);
    }
    else if (action === 'create') {
      if (!seatAvailability.pendingSeats.includes(seatNumber)) {
        seatAvailability.pendingSeats.push(seatNumber);
      }
      seatAvailability.availableSeats = seatAvailability.availableSeats.filter(s => s !== seatNumber);
    }
    else if (action === 'cancel') {
      seatAvailability.bookedSeats = seatAvailability.bookedSeats.filter(s => s !== seatNumber);
      seatAvailability.pendingSeats = seatAvailability.pendingSeats.filter(s => s !== seatNumber);
      if (!seatAvailability.availableSeats.includes(seatNumber)) {
        seatAvailability.availableSeats.push(seatNumber);
      }
      seatAvailability.availableSeats.sort((a, b) => a - b);
    }
    
    await seatAvailability.save();
    return seatAvailability;
  } catch (error) {
    console.error('Update seat availability error:', error);
    throw error;
  }
};

// @desc    Get all bookings with filters
const getBookings = async (req, res) => {
  try {
    const { 
      status, 
      studentEmail, 
      studentId, 
      routeId, 
      travelDate,
      page = 1,
      limit = 100
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase();
    if (studentId) query.studentId = studentId.toUpperCase();
    if (routeId) query.routeId = routeId;
    if (travelDate) {
      const startDate = new Date(travelDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(travelDate);
      endDate.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: startDate, $lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bookings by route and date
const getBookingsByRouteAndDate = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { travelDate } = req.query;

    if (!travelDate) {
      return res.status(400).json({
        success: false,
        message: 'travelDate is required'
      });
    }

    const startDate = new Date(travelDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(travelDate);
    endDate.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      routeId,
      travelDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ seatNumber: 1 });

    // Get route details for total seats
    const route = await Route.findById(routeId);
    let totalSeats = 48;
    
    if (route) {
      if (route.busCapacity) {
        totalSeats = route.busCapacity;
      } else if (route.assignedBus || route.busNumber) {
        const busNumber = route.assignedBus || route.busNumber;
        const bus = await Bus.findOne({ busNumber: busNumber });
        if (bus) {
          totalSeats = bus.capacity || bus.seats || 48;
        }
      }
    }

    const bookedSeats = bookings.filter(b => b.status === 'confirmed').map(b => b.seatNumber);
    const pendingSeats = bookings.filter(b => b.status === 'pending').map(b => b.seatNumber);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        totalSeats,
        bookedSeats,
        pendingSeats,
        availableCount: totalSeats - bookedSeats.length - pendingSeats.length,
        bookedCount: bookedSeats.length,
        pendingCount: pendingSeats.length,
        availableSeats: Array.from({ length: totalSeats }, (_, i) => i + 1).filter(
          seat => !bookedSeats.includes(seat) && !pendingSeats.includes(seat)
        )
      }
    });
  } catch (error) {
    console.error('Get bookings by route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending requests for admin
const getPendingRequests = async (req, res) => {
  try {
    const { routeId, travelDate } = req.query;
    
    let query = { status: 'pending' };
    if (routeId) query.routeId = routeId;
    if (travelDate) {
      const startDate = new Date(travelDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(travelDate);
      endDate.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: startDate, $lte: endDate };
    }

    const pendingRequests = await Booking.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingRequests.length,
      data: pendingRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new booking
const createBooking = async (req, res) => {
  try {
    const {
      routeId,
      routeName,
      busNumber,
      seatNumber,
      travelDate,
      departureTime,
      arrivalTime,
      studentName,
      studentEmail,
      studentPhone,
      studentId,
      ticketPrice,
      paymentSlip
    } = req.body;

    // Validate required fields
    if (!routeId || !routeName || !busNumber || !seatNumber || !travelDate || 
        !departureTime || !studentName || !studentEmail || !studentPhone || 
        !studentId || !ticketPrice || !paymentSlip) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if seat is already booked or pending
    const startDate = new Date(travelDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(travelDate);
    endDate.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      routeId,
      seatNumber,
      travelDate: { $gte: startDate, $lte: endDate },
      departureTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `Seat ${seatNumber} is already booked or pending for this date and time`
      });
    }

    // Check seat availability
    const seatAvailability = await BusSeatAvailability.findOne({
      busNumber,
      routeId,
      travelDate: startDate,
      departureTime
    });
    
    if (seatAvailability && seatAvailability.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({
        success: false,
        message: `Seat ${seatNumber} is already booked`
      });
    }

    // Save payment slip locally
    let paymentSlipUrl = paymentSlip;
    if (paymentSlip && paymentSlip.startsWith('data:image')) {
      const base64Data = paymentSlip.replace(/^data:image\/\w+;base64,/, '');
      const filename = `payment_${Date.now()}_${seatNumber}.jpg`;
      const fs = require('fs');
      const path = require('path');
      const uploadPath = path.join(__dirname, '../uploads', filename);
      fs.writeFileSync(uploadPath, Buffer.from(base64Data, 'base64'));
      paymentSlipUrl = `/uploads/${filename}`;
    }

    // Create booking
    const booking = await Booking.create({
      routeId,
      routeName,
      busNumber,
      seatNumber,
      travelDate: new Date(travelDate),
      departureTime,
      arrivalTime,
      studentName,
      studentEmail: studentEmail.toLowerCase(),
      studentPhone,
      studentId: studentId.toUpperCase(),
      ticketPrice,
      paymentSlip: paymentSlipUrl,
      status: 'pending',
      paymentStatus: 'pending',
      seatStatus: 'pending'
    });

    // Update seat availability
    await updateSeatAvailability(busNumber, routeId, travelDate, departureTime, seatNumber, 'create');

    // Create notification alert
    try {
      await Alert.create({
        message: `New booking request from ${studentName} for ${routeName} - Seat ${seatNumber}`,
        type: 'info',
        route: routeName,
        read: false
      });
    } catch (alertError) {
      console.log('Alert creation skipped:', alertError.message);
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Confirm booking (Admin) - WITH EMAIL NOTIFICATION
const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm booking with status: ${booking.status}`
      });
    }

    // Check if seat is still available
    const startDate = new Date(booking.travelDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(booking.travelDate);
    endDate.setHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      routeId: booking.routeId,
      seatNumber: booking.seatNumber,
      travelDate: { $gte: startDate, $lte: endDate },
      status: 'confirmed'
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: `Seat ${booking.seatNumber} is already confirmed for another booking`
      });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'confirmed',
        paymentStatus: 'verified',
        seatStatus: 'booked',
        approvedBy: approvedBy || 'Admin',
        approvedAt: Date.now()
      },
      { new: true }
    );

    // Update seat availability
    await updateSeatAvailability(
      booking.busNumber, 
      booking.routeId, 
      booking.travelDate, 
      booking.departureTime, 
      booking.seatNumber, 
      'confirm'
    );

    // Create notification alert
    try {
      await Alert.create({
        message: `Booking ${booking.bookingReference} confirmed for ${booking.studentName} - Seat ${booking.seatNumber}`,
        type: 'success',
        route: booking.routeName,
        read: false
      });
    } catch (alertError) {
      console.log('Alert creation skipped:', alertError.message);
    }

    // Send confirmation email (non-blocking - won't affect response if fails)
    try {
      await sendBookingConfirmationEmail(updatedBooking);
      console.log(`✅ Confirmation email sent to ${booking.studentEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
      // Email failure doesn't affect the booking confirmation
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: `Booking confirmed successfully for seat ${booking.seatNumber}`
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject booking (Admin) - WITH EMAIL NOTIFICATION
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status: ${booking.status}`
      });
    }

    const reason = rejectionReason || 'Booking rejected by admin';
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        paymentStatus: 'rejected',
        seatStatus: 'available',
        rejectionReason: reason,
        rejectedAt: Date.now(),
        approvedBy: rejectedBy || 'Admin'
      },
      { new: true }
    );

    // Update seat availability - FREE UP THE SEAT
    await updateSeatAvailability(
      booking.busNumber, 
      booking.routeId, 
      booking.travelDate, 
      booking.departureTime, 
      booking.seatNumber, 
      'reject'
    );

    // Create notification alert
    try {
      await Alert.create({
        message: `Booking ${booking.bookingReference} rejected for ${booking.studentName} - Reason: ${reason}`,
        type: 'warning',
        route: booking.routeName,
        read: false
      });
    } catch (alertError) {
      console.log('Alert creation skipped:', alertError.message);
    }

    // Send rejection email (non-blocking - won't affect response if fails)
    try {
      await sendBookingRejectionEmail(updatedBooking, reason);
      console.log(`✅ Rejection email sent to ${booking.studentEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send rejection email:', emailError.message);
      // Email failure doesn't affect the booking rejection
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: `Booking rejected successfully. Seat ${booking.seatNumber} is now available.`
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking (Student)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentEmail, studentId } = req.body;

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify student identity
    if (booking.studentEmail !== studentEmail && booking.studentId !== studentId.toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Check cancellation deadline (at least 2 hours before departure for confirmed bookings)
    if (booking.status === 'confirmed') {
      const travelDateTime = new Date(booking.travelDate);
      const [hours, minutes] = booking.departureTime.split(':');
      travelDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const now = new Date();
      const hoursDiff = (travelDateTime - now) / (1000 * 60 * 60);
      
      if (hoursDiff < 2) {
        return res.status(400).json({
          success: false,
          message: 'Bookings can only be cancelled at least 2 hours before departure'
        });
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        seatStatus: 'available'
      },
      { new: true }
    );

    // Update seat availability
    await updateSeatAvailability(
      booking.busNumber, 
      booking.routeId, 
      booking.travelDate, 
      booking.departureTime, 
      booking.seatNumber, 
      'cancel'
    );

    // Create cancellation alert
    await Alert.create({
      message: `Booking ${booking.bookingReference} cancelled by ${booking.studentName}`,
      type: 'info',
      route: booking.routeName,
      read: false
    });

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalPending = await Booking.countDocuments({ status: 'pending' });
    const totalConfirmed = await Booking.countDocuments({ status: 'confirmed' });
    const totalRejected = await Booking.countDocuments({ status: 'rejected' });
    const totalCancelled = await Booking.countDocuments({ status: 'cancelled' });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$ticketPrice' } } }
    ]);

    // Get pending requests by route
    const pendingByRoute = await Booking.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$routeName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPending,
        totalConfirmed,
        totalRejected,
        totalCancelled,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingByRoute
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seat availability for a bus/route
const getSeatAvailability = async (req, res) => {
  try {
    const { busNumber } = req.params;
    const { travelDate, departureTime, routeId } = req.query;

    if (!travelDate || !departureTime) {
      return res.status(400).json({
        success: false,
        message: 'travelDate and departureTime are required'
      });
    }

    const startDate = new Date(travelDate);
    startDate.setHours(0, 0, 0, 0);

    let seatAvailability = await BusSeatAvailability.findOne({
      busNumber,
      routeId,
      travelDate: startDate,
      departureTime
    });

    if (!seatAvailability) {
      // Get bus details
      const bus = await Bus.findOne({ busNumber });
      const totalSeats = bus ? (bus.capacity || bus.seats || 40) : 40;
      
      seatAvailability = {
        totalSeats,
        bookedSeats: [],
        pendingSeats: [],
        availableSeats: Array.from({ length: totalSeats }, (_, i) => i + 1)
      };
    }

    res.status(200).json({
      success: true,
      data: seatAvailability
    });
  } catch (error) {
    console.error('Get seat availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export all functions
module.exports = {
  getBookings,
  getBookingById,
  getBookingsByRouteAndDate,
  getPendingRequests,
  createBooking,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getDashboardStats,
  getSeatAvailability
};