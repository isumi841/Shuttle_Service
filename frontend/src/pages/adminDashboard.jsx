import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bus as Shuttle,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Filter,
  LogOut,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiService } from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalShuttles: 0,
      activeShuttles: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalRoutes: 0,
      alertsCount: 0,
    },
    recentActivity: [],
    shuttlePerformance: [],
    userGrowth: [],
    routeUsage: [],
  });

  const fetchShuttleCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shuttles`);
      if (response.ok) {
        const data = await response.json();
        const shuttles = data.data || [];
        const activeShuttles = shuttles.filter((b) => b.isActive !== false).length;

        return {
          totalShuttles: shuttles.length,
          activeShuttles: activeShuttles,
        };
      }
    } catch (error) {
      // Ignore shuttle count fetch failures and keep dashboard fallback values.
    }
    return { totalShuttles: 0, activeShuttles: 0 };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard analytics
      const response = await apiService.get("/users/dashboard/analytics");

      // Fetch real shuttle count
      const shuttleData = await fetchShuttleCount();

      if (response.data.success) {
        // Merge shuttle data with dashboard data
        setDashboardData({
          ...response.data.data,
          stats: {
            ...response.data.data.stats,
            totalShuttles: shuttleData.totalShuttles,
            activeShuttles: shuttleData.activeShuttles,
          },
        });
      } else {
        // Still update shuttle stats even if analytics fail
        setDashboardData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalShuttles: shuttleData.totalShuttles,
            activeShuttles: shuttleData.activeShuttles,
          },
        }));
      }
    } catch (error) {

      // Try to at least get shuttle data
      const shuttleData = await fetchShuttleCount();
      setDashboardData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalShuttles: shuttleData.totalShuttles,
          activeShuttles: shuttleData.activeShuttles,
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchDashboardData();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const handleRoutes = () => {
    navigate("/admin/routes");
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate("/admin/profile");
  };

  /*const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    return;
  };*/

  const handleUserManagement = () => {
    navigate("/admin/userlist");
  };

  const handleManageShuttles = () => {
    navigate("/admin/shuttle-management");
  };

  const handleAnalytics = () => {
    navigate("/admin/useranalytics");
  };

  const handleAlerts = () => {
    navigate("/adminbookings");
  };

  const handleReports = () => {
    navigate("/admin/useranalytics");
  };

  const StatCard = ({
    title,
    value,
    change,
    trend,
    bgColor = "bg-blue-600",
    IconComponent,
    onClick,
  }) => {
    const Icon = IconComponent;

    const CardContent = (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend === "down"
                    ? "rotate-180 text-red-500"
                    : "text-green-500"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  trend === "down" ? "text-red-500" : "text-green-500"
                }`}
              >
                {change}
              </p>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-xl`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    );

    if (onClick) {
      return (
        <div
          onClick={onClick}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
        >
          {CardContent}
          <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        {CardContent}
      </div>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "critical":
          return "bg-red-50 text-red-600 border-red-100";
        case "warning":
          return "bg-yellow-50 text-yellow-600 border-yellow-100";
        case "success":
          return "bg-green-50 text-green-600 border-green-100";
        default:
          return "bg-blue-50 text-blue-600 border-blue-100";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "critical":
          return <XCircle className="w-4 h-4" />;
        case "warning":
          return <AlertTriangle className="w-4 h-4" />;
        case "success":
          return <CheckCircle className="w-4 h-4" />;
        default:
          return <Activity className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
        <div
          className={`p-2 rounded-lg mr-4 border ${getStatusColor(
            activity.status
          )}`}
        >
          {getStatusIcon(activity.status)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {activity.message}
          </p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <LogOut className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to log in again to
                access your account.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shuttle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ShuttleWatch Nexus
                </h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 ml-8">
              <Clock className="w-4 h-4" />
              <span>
                {currentTime.toLocaleString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* <div className="relative">
              <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {dashboardData.stats.alertsCount || 0}
              </span>
            </div>*/}

            <div className="relative">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl px-4 py-2 transition-colors"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  {/* <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>*/}
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        ></div>
      )}

      <main className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>{isLoading ? "Loading..." : "Refresh"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-64"
              />
            </div>
            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Shuttles"
            value={dashboardData.stats.totalShuttles}
            change={`${dashboardData.stats.totalShuttles} registered`}
            IconComponent={Shuttle}
            trend="up"
            bgColor="bg-blue-600"
            onClick={handleManageShuttles}
          />
          <StatCard
            title="Active Shuttles"
            value={dashboardData.stats.activeShuttles}
            change={`${(
              (dashboardData.stats.activeShuttles /
                (dashboardData.stats.totalShuttles || 1)) *
              100
            ).toFixed(0)}% active`}
            IconComponent={Activity}
            trend="up"
            bgColor="bg-green-500"
            onClick={handleManageShuttles}
          />
          <StatCard
            title="Total Users"
            value={dashboardData.stats.totalUsers}
            change="+15% this month"
            IconComponent={Users}
            trend="up"
            bgColor="bg-blue-600"
          />
          <StatCard
            title="Active Users"
            value={dashboardData.stats.activeUsers}
            change="71% engagement"
            IconComponent={UserCheck}
            trend="up"
            bgColor="bg-green-500"
          />
          <StatCard
            title="Routes"
            value={dashboardData.stats.totalRoutes}
            IconComponent={Navigation}
            bgColor="bg-blue-600"
          />
          <StatCard
            title="Alerts"
            value={dashboardData.stats.alertsCount}
            change="2 resolved today"
            IconComponent={AlertTriangle}
            trend="down"
            bgColor="bg-yellow-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Shuttle Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Shuttle Performance Today
              </h3>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Delayed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">On Time</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.shuttlePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="delayed"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="onTime"
                  stackId="3"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                User Growth
              </h3>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
            {dashboardData.userGrowth && dashboardData.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2563eb"
                    strokeWidth={3}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">No user growth data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {dashboardData.recentActivity &&
              dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Route Usage
            </h3>
            {dashboardData.routeUsage && dashboardData.routeUsage.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={dashboardData.routeUsage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.routeUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-3">
                  {dashboardData.routeUsage.map((route, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: route.color }}
                        ></div>
                        <span className="text-gray-700 font-medium">
                          {route.name}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {route.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-gray-500">No route data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={handleManageShuttles}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <Shuttle className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Manage Shuttles
              </span>
            </button>
            <button
              onClick={handleUserManagement}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <Users className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                User Management
              </span>
            </button>
            <button
              onClick={handleRoutes}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <MapPin className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Routes
              </span>
            </button>
            <button
              onClick={handleAnalytics}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <BarChart3 className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Analytics
              </span>
            </button>
            <button
              onClick={handleAlerts}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <AlertTriangle className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Alerts
              </span>
            </button>
            <button
              onClick={handleReports}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 group"
            >
              <Activity className="w-8 h-8 text-blue-600 group-hover:text-white mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Reports
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

