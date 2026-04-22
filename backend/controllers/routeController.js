const Route = require("../Model/Route");
const Bus = require("../Model/Bus");

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { stops: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }
    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Public
const createRoute = async (req, res) => {
  try {
    const {
      name,
      stops,
      departure,
      arrival,
      distance,
      ticketPrice,
      assignedBus,
      scheduleDays,
      startDate,
      endDate,
    } = req.body;

    // Check if bus exists
    const bus = await Bus.findOne({ busNumber: assignedBus });
    if (!bus) {
      return res.status(400).json({
        success: false,
        message: "Assigned bus not found",
      });
    }

    // Check if bus is active
    if (bus.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Assigned bus is not active",
      });
    }

    const route = await Route.create({
      name,
      stops,
      departure,
      arrival,
      distance,
      ticketPrice,
      assignedBus,
      scheduleDays,
      startDate,
      endDate,
      status: "active",
      rating: 0,
      trips: 0,
    });

    res.status(201).json({
      success: true,
      data: route,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Public
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // If assigned bus is being changed, verify the new bus
    if (req.body.assignedBus && req.body.assignedBus !== route.assignedBus) {
      const bus = await Bus.findOne({ busNumber: req.body.assignedBus });
      if (!bus) {
        return res.status(400).json({
          success: false,
          message: "Assigned bus not found",
        });
      }
      if (bus.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Assigned bus is not active",
        });
      }
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedRoute,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Public
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    await route.deleteOne();
    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get route stats
// @route   GET /api/routes/stats/summary
// @access  Public
const getRouteStats = async (req, res) => {
  try {
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = await Route.countDocuments({ status: "active" });
    const totalTrips = await Route.aggregate([
      { $group: { _id: null, total: { $sum: "$trips" } } },
    ]);
    const avgRating = await Route.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRoutes,
        activeRoutes,
        totalTrips: totalTrips[0]?.total || 0,
        avgRating: (avgRating[0]?.avg || 0).toFixed(1),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  getRouteStats,
};