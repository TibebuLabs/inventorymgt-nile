// src/pages/DepartmentHeadDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSmartphone, 
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPlus,
  FiSettings,
  FiBarChart2,
  FiAlertTriangle,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiArrowRight,
  FiUser
} from 'react-icons/fi';

type DashboardCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  onClick?: () => void;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span className="text-sm text-gray-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          View details <FiArrowRight className="ml-1" />
        </span>
      </div>
    </div>
  );
};

const DepartmentHeadDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock data - replace with real data from your API
  const deviceStats = {
    total: 42,
    available: 15,
    assigned: 24,
    pendingRequests: 8
  };

  // Card click handlers
  const handleTotalDevicesClick = () => {
    navigate('/devices');
  };

  const handleAvailableDevicesClick = () => {
    navigate('/devices?status=available');
  };

  const handleAssignedDevicesClick = () => {
    navigate('/devices?status=assigned');
  };

  const handlePendingRequestsClick = () => {
    navigate('/requests?status=pending');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Department Head Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your department's devices and requests</p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <DashboardCard
          title="Total User"
          value={deviceStats.total}
          icon={<FiUsers className="w-5 h-5" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          onClick={handleTotalDevicesClick}
        />
        
        <DashboardCard
          title="Requested Devices"
          value={deviceStats.available}
          icon={<FiCheckCircle className="w-5 h-5" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          onClick={handleAvailableDevicesClick}
        />
        
        <DashboardCard
          title="Assigned Devices"
          value={deviceStats.assigned}
          icon={<FiUsers className="w-5 h-5" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          onClick={handleAssignedDevicesClick}
        />
        
        <DashboardCard
          title="Rejected Devices"
          value={deviceStats.pendingRequests}
          icon={<FiClock className="w-5 h-5" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          onClick={handlePendingRequestsClick}
        />
        <DashboardCard
          title="Request  Devices"
          value={deviceStats.pendingRequests}
          icon={<FiClock className="w-5 h-5" />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          onClick={handlePendingRequestsClick}
        />
      </section>

      {/* Other dashboard sections... */}
    </div>
  );
};

export default DepartmentHeadDashboard;