require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================== STATIC FILES ================== */
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

/* ================== ROUTES ================== */
const routeRoutes = require("./Route/routeRoutes");
app.use("/api/routes", routeRoutes);

app.use('/api/buses', require('./Route/busRoutes'));

const alertRoutes = require('./Route/alertRoutes');
app.use('/api/alerts', alertRoutes);

const bookingRoutes = require('./Route/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

/* ================== DATABASE ================== */
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://isumikumarasinghe14:sj4GzsDbnDaC1sLv@cluster0.mzj2mmp.mongodb.net/BusRoute?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

/* ================== MONGOOSE EVENTS ================== */
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

/* ================== ERROR HANDLING ================== */
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ================== 404 HANDLER ================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});