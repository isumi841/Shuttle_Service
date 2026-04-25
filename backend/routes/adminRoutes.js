// routes/adminRoutes.js
const express = require("express");
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

const router = express.Router();

// Get all admins
router.get("/", getAllAdmins);

// Get a single admin by ID
router.get("/:id", getAdminById);

// Create a new admin
router.post("/", createAdmin);

// Update an existing admin
router.put("/:id", updateAdmin);

// Delete an admin
router.delete("/:id", deleteAdmin);

module.exports = router;