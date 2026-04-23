const Alert = require("../Model/Alert");

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const { read, type } = req.query;
    let query = {};

    if (read !== undefined) {
      query.read = read === "true";
    }

    if (type) {
      query.type = type;
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }
    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Public
const createAlert = async (req, res) => {
  try {
    const { message, type, route } = req.body;

    const alert = await Alert.create({
      message,
      type: type || "info",
      route,
      read: false,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create delay alert for a route
// @route   POST /api/alerts/delay
// @access  Public
const createDelayAlert = async (req, res) => {
  try {
    const { routeName, delayMinutes, reason } = req.body;

    const message = `⚠️ ${routeName} delayed by ${delayMinutes} minutes${reason ? ` due to ${reason}` : ""}`;

    const alert = await Alert.create({
      message,
      type: "warning",
      route: routeName,
      read: false,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update alert (mark as read)
// @route   PUT /api/alerts/:id
// @access  Public
const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { read: true },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Public
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    await alert.deleteOne();
    res.status(200).json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark all alerts as read
// @route   PUT /api/alerts/mark-all-read
// @access  Public
const markAllAsRead = async (req, res) => {
  try {
    await Alert.updateMany({ read: false }, { read: true });
    res.status(200).json({
      success: true,
      message: "All alerts marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread count
// @route   GET /api/alerts/unread/count
// @access  Public
const getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({ read: false });
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  createDelayAlert,
  updateAlert,
  deleteAlert,
  markAllAsRead,
  getUnreadCount,
};