// src/pages/EmployeeDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSmartphone, 
  FiClock, 
  FiCheckCircle, 
  FiPlus
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
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
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

  const EmployeeDashboard: React.FC = () => {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Employee Device Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your assigned devices and requests</p>
      </header>

      {/* Device Summary Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <DashboardCard
            title="Assigned Devices"
            value={"0"}
            icon={<FiSmartphone className="w-5 h-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            onClick={() => console.log('View assigned devices')}
          />
          
          <DashboardCard
            title="Pending Requests"
            value={"0"}
            icon={<FiClock className="w-5 h-5" />}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            onClick={() => console.log('View pending requests')}
          />
          
          <DashboardCard
            title="Returned Devices"
            value={"0"}
            icon={<FiCheckCircle className="w-5 h-5" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => console.log('View returned devices')}
          />
        </div>
      </section>

      {/* Device Request Section */}
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <button
          onClick={() => navigate('./Employee/components/RequisitionForm')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus /> {'New Request'}
          </button>
          
        </div>
      </div>
    </section>
    </div>
  );
};

export default EmployeeDashboard;