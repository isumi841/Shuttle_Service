const Bus = require("../Model/Bus");
const Route = require("../Model/Route");

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getBuses = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { busNumber: { $regex: search, $options: "i" } },
        { driver: { $regex: search, $options: "i" } },
      ];
    }

    const buses = await Bus.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }
    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Public
const createBus = async (req, res) => {
  try {
    const { busNumber, seats, driver, contact, status, capacity, lastMaintenance, fuelEfficiency } = req.body;

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus number already exists",
      });
    }

    const bus = await Bus.create({
      busNumber,
      seats,
      driver,
      contact,
      status: status || "active",
      capacity: capacity || seats,
      lastMaintenance,
      fuelEfficiency,
    });

    res.status(201).json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Public
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Check if new bus number conflicts
    if (req.body.busNumber && req.body.busNumber !== bus.busNumber) {
      const existingBus = await Bus.findOne({ busNumber: req.body.busNumber });
      if (existingBus) {
        return res.status(400).json({
          success: false,
          message: "Bus number already exists",
        });
      }
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Update assigned bus number in routes if bus number changed
    if (req.body.busNumber && req.body.busNumber !== bus.busNumber) {
      await Route.updateMany(
        { assignedBus: bus.busNumber },
        { assignedBus: req.body.busNumber }
      );
    }

    res.status(200).json({
      success: true,
      data: updatedBus,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Public
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Check if bus is assigned to any route
    const assignedRoutes = await Route.find({ assignedBus: bus.busNumber });
    if (assignedRoutes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete bus that is assigned to ${assignedRoutes.length} active route(s). Please reassign routes first.`,
      });
    }

    await bus.deleteOne();
    res.status(200).json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get bus stats
// @route   GET /api/buses/stats/summary
// @access  Public
const getBusStats = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: "active" });
    const maintenanceBuses = await Bus.countDocuments({ status: "maintenance" });
    const totalSeats = await Bus.aggregate([
      { $group: { _id: null, total: { $sum: "$seats" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBuses,
        activeBuses,
        maintenanceBuses,
        totalSeats: totalSeats[0]?.total || 0,
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
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  getBusStats,
};