import React from "react";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-4">
        <Link
          to="/admin/routes"
          className="block bg-red-600 text-white px-4 py-3 rounded hover:bg-blue-700"
        >
          Manage Routes
        </Link>
        {/* Later: Add Manage Shuttles, Drivers, Users */}
      </div>
    </div>
  );
}
