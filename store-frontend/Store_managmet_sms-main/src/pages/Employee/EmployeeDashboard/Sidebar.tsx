import {  FiFileText, FiClipboard, } from "react-icons/fi";
import { Link } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  return (
    <aside
      className={`bg-white shadow-md p-6 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <h2 className={`text-xl font-bold mb-6 ${collapsed ? "hidden" : "block"}`}>
      </h2>
      <ul className="space-y-4">
        <li className="flex items-center gap-4 text-gray-600 hover:text-black cursor-pointer">
          <Link to="/RequisitionForm" className="flex items-center gap-4">
            <FiFileText />
            {!collapsed && <span>Requisition Form</span>}
          </Link>
        </li>
        <li className="flex items-center gap-4 text-gray-600 hover:text-black cursor-pointer">
          <Link to="/StatusPage" className="flex items-center gap-4">
            <FiClipboard />
            {!collapsed && <span>Status Page</span>}
          </Link>
        </li>
      
      </ul>
    </aside>
  );
};

export default Sidebar;