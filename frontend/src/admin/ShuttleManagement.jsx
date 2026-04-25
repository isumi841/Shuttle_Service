import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Save,
  Menu,
  Edit,
  Trash2,
  Loader2,
  Bus as ShuttleIcon,
  Activity,
  AlertTriangle,
  Navigation,
  LayoutDashboard,
} from 'lucide-react';

import ShuttleTable from "../components/ShuttleTable";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// API Service Functions
const shuttleAPI = {
  // Get all shuttles
  getAllShuttles: async () => {
    const response = await fetch(`${API_BASE_URL}/shuttles`);
    if (!response.ok) {
      throw new Error("Failed to fetch shuttles");
    }
    return response.json();
  },

  // Create new shuttle
  createShuttle: async (shuttleData) => {
    const response = await fetch(`${API_BASE_URL}/shuttles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shuttleData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create shuttle");
    }
    return response.json();
  },

  // Update shuttle
  updateShuttle: async (id, shuttleData) => {
    const response = await fetch(`${API_BASE_URL}/shuttles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shuttleData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update shuttle");
    }
    return response.json();
  },

  // Delete shuttle
  deleteShuttle: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shuttles/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete shuttle");
    }
    return response.json();
  },
};

const ShuttleManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Default to showing table view unless explicitly requesting form
  const [showForm, setShowForm] = useState(searchParams.get("view") === "form");

  const [formData, setFormData] = useState({
    shuttle_number: "",
    driver_name: "",
    shuttle_route: "",
  });
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingShuttle, setEditingShuttle] = useState(null);
  const [shuttleStats, setShuttleStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    routes: 0,
  });

  // Fetch shuttles data
  const fetchShuttles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await shuttleAPI.getAllShuttles();
      const shuttleData = response.data || [];
      setShuttles(shuttleData);

      // Calculate statistics
      const uniqueRoutes = new Set(shuttleData.map((shuttle) => shuttle.shuttle_route)).size;
      setShuttleStats({
        total: shuttleData.length,
        active: shuttleData.filter((b) => b.isActive !== false).length,
        inactive: shuttleData.filter((b) => b.isActive === false).length,
        routes: uniqueRoutes,
      });
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:8000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load shuttles when component mounts or when switching to table view
  useEffect(() => {
    if (!showForm) {
      fetchShuttles();
    }
  }, [showForm]);

  const handleNavClick = (section) => {
    switch (section) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "shuttle-management":
        navigate("/admin/shuttle-management");
        break;
      case "route-management":
        navigate("/admin/routes");
        break;
      case "driver-approval":
        alert("Driver approval page coming soon!");
        break;
      default:
        alert(`Navigating to ${section}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for driver name - only letters and spaces
    if (name === "driver_name") {
      // Allow only letters (including unicode letters) and spaces
      const validDriverName = /^[a-zA-Z\s]*$/;
      if (!validDriverName.test(value)) {
        return; // Don't update if invalid characters are entered
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate shuttle number format (SHUTTLE-XXX)
    const shuttleNumberPattern = /^SHUTTLE-\d{3}$/;
    if (!shuttleNumberPattern.test(formData.shuttle_number)) {
      setError(
        'Shuttle number must be in format "SHUTTLE-001" (SHUTTLE- followed by 3 digits)'
      );
      return;
    }

    // Validate driver name - only letters and spaces
    const driverNamePattern = /^[a-zA-Z\s]+$/;
    if (!driverNamePattern.test(formData.driver_name)) {
      setError(
        "Driver name can only contain letters and spaces (no numbers or special symbols)"
      );
      return;
    }

    // Validate driver name is not empty after trim
    if (formData.driver_name.trim() === "") {
      setError("Driver name cannot be empty");
      return;
    }

    // Check if shuttle number already exists (only when adding new shuttle, not editing)
    if (!editingShuttle) {
      const existingShuttle = shuttles.find(
        (shuttle) =>
          shuttle.shuttle_number.toLowerCase() === formData.shuttle_number.toLowerCase()
      );
      if (existingShuttle) {
        setError(
          `Shuttle number "${formData.shuttle_number}" already exists! Please use a different shuttle number.`
        );
        alert(
          `Shuttle number "${formData.shuttle_number}" is already registered in the system. Please use a different shuttle number.`
        );
        return;
      }
    } else {
      // When editing, check if shuttle number exists in other shuttles (not the current one)
      const existingShuttle = shuttles.find(
        (shuttle) =>
          shuttle.shuttle_number.toLowerCase() === formData.shuttle_number.toLowerCase() &&
          shuttle._id !== editingShuttle._id
      );
      if (existingShuttle) {
        setError(
          `Shuttle number "${formData.shuttle_number}" already exists! Please use a different shuttle number.`
        );
        alert(
          `Shuttle number "${formData.shuttle_number}" is already registered to another shuttle. Please use a different shuttle number.`
        );
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (editingShuttle) {
        // Update existing shuttle
        await shuttleAPI.updateShuttle(editingShuttle._id, formData);
        setSuccess("Shuttle updated successfully!");
      } else {
        // Create new shuttle
        await shuttleAPI.createShuttle(formData);
        setSuccess("Shuttle created successfully!");
      }

      // Reset form and switch to table view
      setFormData({ shuttle_number: "", driver_name: "", shuttle_route: "" });
      setEditingShuttle(null);
      setShowForm(false);

      // Refresh the shuttle list to show the new/updated shuttle
      fetchShuttles();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:8000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setFormData({ shuttle_number: "", driver_name: "", shuttle_route: "" });
    setEditingShuttle(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEditShuttle = (shuttle) => {
    setFormData({
      shuttle_number: shuttle.shuttle_number,
      driver_name: shuttle.driver_name,
      shuttle_route: shuttle.shuttle_route,
    });
    setEditingShuttle(shuttle);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleDeleteShuttle = async (shuttleId) => {
    if (!window.confirm("Are you sure you want to delete this shuttle?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await shuttleAPI.deleteShuttle(shuttleId);
      setSuccess("Shuttle deleted successfully!");
      fetchShuttles(); // Refresh the list

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err.message.includes("Failed to fetch")) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running on http://localhost:8000"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <ShuttleTable
        onAddNew={handleBackToForm}
        shuttles={shuttles}
        loading={loading}
        error={error}
        success={success}
        onEdit={handleEditShuttle}
        onDelete={handleDeleteShuttle}
        onRefresh={fetchShuttles}
        shuttleStats={shuttleStats}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShuttleIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Shuttle Management
                </h1>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Shuttles</p>
                <p className="text-3xl font-bold text-gray-900">
                  {shuttleStats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShuttleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {shuttleStats.active}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Routes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {shuttleStats.routes}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {shuttleStats.inactive}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {editingShuttle ? "Edit Shuttle" : "Add New Shuttle"}
              </h2>
              <p className="text-gray-600 mt-2">
                {editingShuttle
                  ? "Update shuttle information"
                  : "Add a new shuttle to the fleet"}
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              View All Shuttles
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
            <Activity className="h-5 w-5 mr-3" />
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shuttle Number */}
              <div>
                <label
                  htmlFor="shuttle_number"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Shuttle Number *
                </label>
                <input
                  type="text"
                  id="shuttle_number"
                  name="shuttle_number"
                  value={formData.shuttle_number}
                  onChange={handleInputChange}
                  placeholder="e.g., SHUTTLE-001"
                  pattern="SHUTTLE-\d{3}"
                  title="Shuttle number must be in format SHUTTLE-001 (SHUTTLE- followed by 3 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: SHUTTLE-001 (SHUTTLE- followed by 3 digits)
                </p>
              </div>

              {/* Driver Name */}
              <div>
                <label
                  htmlFor="driver_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Driver Name *
                </label>
                <input
                  type="text"
                  id="driver_name"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Dasun Kumar"
                  pattern="[a-zA-Z\s]+"
                  title="Driver name can only contain letters and spaces"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only letters and spaces allowed
                </p>
              </div>
            </div>

            {/* Shuttle Route */}
            <div>
              <label
                htmlFor="shuttle_route"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shuttle Route *
              </label>
              <input
                type="text"
                id="shuttle_route"
                name="shuttle_route"
                value={formData.shuttle_route}
                onChange={handleInputChange}
                placeholder="e.g., Negombo - Malabe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {loading
                  ? editingShuttle
                    ? "Updating..."
                    : "Adding..."
                  : editingShuttle
                  ? "Update Shuttle"
                  : "Add Shuttle"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ShuttleManagement;
