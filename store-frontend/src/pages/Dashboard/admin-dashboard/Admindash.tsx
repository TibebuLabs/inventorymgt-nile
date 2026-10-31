// src/pages/DashboardPage.tsx
import React from 'react';
import { 
  FiUsers, 
  FiPackage, 
  FiTrendingUp, 
  FiSmartphone,
  FiClipboard,
  FiCheckCircle,
  FiHelpCircle
} from 'react-icons/fi';

type DashboardCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  description,
  className = '',
  iconBgColor = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center">
          {trend && (
            <span className={`flex items-center text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? (
                <FiTrendingUp className="w-4 h-4 mr-1" />
              ) : trend === 'down' ? (
                <FiTrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
              )}
              {trendValue}
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-500 ml-2">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

const Admindashboard: React.FC = () => {
  // Click handlers for cards
  const handleCardClick = (cardTitle: string) => {
    console.log(`${cardTitle} card clicked`);
    // You can replace this with navigation or state updates
    alert(`You clicked the ${cardTitle} card`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your system overview.</p>
      </header>

      {/* User and Device Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">User & Device Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardCard
            title="Total Users"
            value="2,420"
            icon={<FiUsers className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => handleCardClick("Total Users")}
          />
          
          <DashboardCard
            title="Total Devices"
            value="1,843"
            icon={<FiSmartphone className="w-5 h-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            onClick={() => handleCardClick("Total Devices")}
          />
          
          <DashboardCard
            title="Devices In Stock"
            value="542"
            icon={<FiPackage className="w-5 h-5" />}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            onClick={() => handleCardClick("Devices In Stock")}
          />
          
          <DashboardCard
            title="Devices Checked Out"
            value="1,234"
            icon={<FiUsers className="w-5 h-5" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => handleCardClick("Devices Checked Out")}
          />
        </div>
      </section>

      {/* Requests Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Requests Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <DashboardCard
            title="Pending Requests"
            value="28"
            icon={<FiClipboard className="w-5 h-5" />}
            className="border-l-4 border-orange-500"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            onClick={() => handleCardClick("Pending Requests")}
          />
          
          <DashboardCard
            title="Approved Requests"
            value="142"
            icon={<FiCheckCircle className="w-5 h-5" />}
            className="border-l-4 border-green-500"
            iconBgColor="bg-teal-100"
            iconColor="text-teal-600"
            onClick={() => handleCardClick("Approved Requests")}
          />
          
          <DashboardCard
            title="Rejected Requests"
            value="12"
            icon={<FiHelpCircle className="w-5 h-5" />}
            className="border-l-4 border-red-500"
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
            onClick={() => handleCardClick("Rejected Requests")}
          />
        </div>
      </section>

      {/* Quick Stats */}
      
    </div>
  );
};

export default Admindashboard;