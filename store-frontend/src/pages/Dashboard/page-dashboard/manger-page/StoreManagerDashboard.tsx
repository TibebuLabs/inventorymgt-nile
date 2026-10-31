// src/pages/StoreManagerDashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiClock,
  FiAlertTriangle,
  FiUsers,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiPrinter,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiHardDrive,
  FiUserPlus,
  FiBell,
} from "react-icons/fi";

type Device = {
  id: string;
  name: string;
  type: "printer" | "laptop" | "phone" | "tablet" | "other";
  status: "in-stock" | "assigned" | "requested" | "maintenance";
  quantity: number;
  assignedTo?: string;
  requestedBy?: string;
};

type StatusBarProps = {
  value: number;
  max: number;
  thresholds: {
    warning: number;
    critical: number;
  };
  label: string;
  icon: React.ReactNode;
};

const StatusBar: React.FC<StatusBarProps> = ({
  value,
  max,
  thresholds,
  label,
  icon,
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  const status =
    value >= thresholds.warning
      ? "healthy"
      : value >= thresholds.critical
      ? "warning"
      : "critical";

  const statusColors = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div className="mr-2 text-gray-600">{icon}</div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-xs font-medium">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low stock</span>
        <span>Well stocked</span>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-indigo-100",
  iconColor = "text-indigo-600",
  onClick,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StoreManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [devices] = useState<Device[]>([
    {
      id: "DEV001",
      name: "HP LaserJet Pro",
      type: "printer",
      status: "in-stock",
      quantity: 8,
    },
    {
      id: "DEV002",
      name: 'MacBook Pro 16"',
      type: "laptop",
      status: "in-stock",
      quantity: 15,
    },
    {
      id: "DEV003",
      name: "iPhone 14 Pro",
      type: "phone",
      status: "assigned",
      quantity: 1,
      assignedTo: "John Smith",
    },
    {
      id: "DEV004",
      name: "Dell XPS 15",
      type: "laptop",
      status: "requested",
      quantity: 1,
      requestedBy: "Sarah Johnson",
    },
    {
      id: "DEV005",
      name: 'iPad Pro 12.9"',
      type: "tablet",
      status: "maintenance",
      quantity: 1,
    },
    {
      id: "DEV006",
      name: "Canon Pixma",
      type: "printer",
      status: "in-stock",
      quantity: 5,
    },
    {
      id: "DEV007",
      name: "Surface Laptop 4",
      type: "laptop",
      status: "in-stock",
      quantity: 22,
    },
    {
      id: "DEV008",
      name: "Samsung Galaxy S22",
      type: "phone",
      status: "in-stock",
      quantity: 18,
    },
    {
      id: "DEV009",
      name: "Dell OptiPlex",
      type: "other",
      status: "in-stock",
      quantity: 12,
    },
  ]);

  // Mock user data
  const totalUsers = 42;
  const newRequests = 7;
  const pendingApprovals = 3;

  // Device type thresholds
  const deviceThresholds = {
    printer: { warning: 10, critical: 5 },
    laptop: { warning: 15, critical: 8 },
    phone: { warning: 20, critical: 10 },
    tablet: { warning: 12, critical: 6 },
    other: { warning: 10, critical: 5 },
  };

  // Calculate device type summaries
  const deviceSummaries = [
    { type: "printer", icon: <FiPrinter />, label: "Printers" },
    { type: "laptop", icon: <FiMonitor />, label: "Laptops" },
    { type: "phone", icon: <FiSmartphone />, label: "Phones" },
    { type: "tablet", icon: <FiTablet />, label: "Tablets" },
    { type: "other", icon: <FiHardDrive />, label: "Other Devices" },
  ].map(({ type, icon, label }) => {
    const typeDevices = devices.filter((d) => d.type === type);
    const inStock = typeDevices
      .filter((d) => d.status === "in-stock")
      .reduce((sum, d) => sum + d.quantity, 0);
    const total = typeDevices.reduce((sum, d) => sum + d.quantity, 0);

    return {
      type,
      icon,
      label,
      inStock,
      total,
      thresholds:
        deviceThresholds[type as keyof typeof deviceThresholds] ||
        deviceThresholds.other,
    };
  });

  // Overall stats
  const totalDevices = devices.reduce((sum, d) => sum + d.quantity, 0);
  const inStockCount = devices
    .filter((d) => d.status === "in-stock")
    .reduce((sum, d) => sum + d.quantity, 0);
  const assignedCount = devices.filter((d) => d.status === "assigned").length;
  const maintenanceCount = devices.filter(
    (d) => d.status === "maintenance"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Store Manager Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage inventory, assignments, and requests
        </p>
      </header>

      {/* Search and Actions */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search devices, types, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate("/add-device")}
              >
                <FiPlus /> Add New Device
              </button>

              <button
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={() => navigate("/inventory-check")}
              >
                <FiRefreshCw /> Inventory Check
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard
            title="Total Devices"
            value={totalDevices}
            icon={<FiPackage />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => navigate("/inventory")}
          />
          <InfoCard
            title="Total Users"
            value={totalUsers}
            icon={<FiUsers />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => navigate("/users")}
          />
          <InfoCard
            title="New Requests"
            value={newRequests}
            icon={<FiBell />}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            onClick={() => navigate("/requests")}
          />
          <InfoCard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={<FiClock />}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            onClick={() => navigate("/approvals")}
          />
        </div>
      </section>

      {/* Inventory Status Section */}
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Inventory Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4">
                Device Type Status
              </h3>
              {deviceSummaries.map((summary) => (
                <StatusBar
                  key={summary.type}
                  value={summary.inStock}
                  max={summary.thresholds.warning * 2}
                  thresholds={summary.thresholds}
                  label={summary.label}
                  icon={summary.icon}
                />
              ))}
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4">
                Inventory Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  title="In Stock"
                  value={inStockCount}
                  icon={<FiPackage />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                  onClick={() => navigate("/inventory?status=in-stock")}
                />
                <InfoCard
                  title="Assigned"
                  value={assignedCount}
                  icon={<FiUsers />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  onClick={() => navigate("/assignments")}
                />
                <InfoCard
                  title="Maintenance"
                  value={maintenanceCount}
                  icon={<FiAlertTriangle />}
                  iconBgColor="bg-red-100"
                  iconColor="text-red-600"
                  onClick={() => navigate("/maintenance")}
                />
                <InfoCard
                  title="New Users"
                  value="5"
                  icon={<FiUserPlus />}
                  iconBgColor="bg-indigo-100"
                  iconColor="text-indigo-600"
                  onClick={() => navigate("/users?filter=new")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoreManagerDashboard;
