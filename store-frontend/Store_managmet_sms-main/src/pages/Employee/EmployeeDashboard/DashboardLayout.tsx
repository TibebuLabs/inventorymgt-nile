import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
// Import the MessageCard component
import { ReactNode } from "react";

interface DepartDashboardProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DepartDashboardProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Topbar */}
      <Topbar onToggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar collapsed={!isSidebarOpen} />

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
      

          {/* Render Children */}
          {children}
        </main>
      </div>

      {/* Bottom Bar */}
      <footer className="bg-white shadow-md p-4 text-center text-gray-600">
        © 2023 Device Dashboard. All rights reserved.
      </footer>
    </div>
  );
};

export default DashboardLayout;