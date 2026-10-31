import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaBuilding,
  FaTruck,
  FaBoxOpen,
  FaEye,
  FaFileInvoice,
  FaFileAlt,
  FaClipboardCheck,
  FaListAlt,
  FaKey,
  FaBox,
  FaClipboardList,
  FaWarehouse,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaCaretUp,
  FaCaretDown,
  FaUsersCog,
  FaSitemap,
  FaUserPlus,
  FaClipboard,
  FaHistory,
  FaLock,
  FaShoppingCart,
  FaListOl,
  FaBoxes,
  FaBell,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";

type Role =
  | "admin"
  | "store-manager"
  | "store-keeper"
  | "employee"
  | "department-head";

interface DashboardProps {
  role: Role;
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("");
  const [isGoodsReceivingOpen, setIsGoodsReceivingOpen] =
    useState<boolean>(false);
  const [isRequestionOpen, setIsRequestionOpen] = useState<boolean>(false);
  const [isStoreIssueVoucherOpen, setIsStoreIssueVoucherOpen] =
    useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isViewStockControlCardpopen, setViewStockControlCardprn] =
    useState<boolean>(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] =
    useState<boolean>(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState<boolean>(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = location.pathname.split("/").pop() || "";
    setActiveTab(path);
  }, [location]);

  useEffect(() => {
    if (role === "admin") setActiveTab("employees");
    else if (role === "store-manager") setActiveTab("products");
    else if (role === "store-keeper") setActiveTab("good-receiving-input");
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsGoodsReceivingOpen(false);
        setIsRequestionOpen(false);
        setIsStoreIssueVoucherOpen(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSidebarLinkClick = () => {
    setIsGoodsReceivingOpen(false);
    setIsRequestionOpen(false);
    setIsStoreIssueVoucherOpen(false);
    setIsSidebarOpen(false);
    setViewStockControlCardprn(false);
  };

  const toggleDropdown = (menu: string) => {
    setIsGoodsReceivingOpen(
      menu === "goods-receiving" ? !isGoodsReceivingOpen : false
    );
    setIsRequestionOpen(menu === "requestion" ? !isRequestionOpen : false);
    setIsStoreIssueVoucherOpen(
      menu === "store-issue-voucher" ? !isStoreIssueVoucherOpen : false
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
    setIsNotificationDropdownOpen(false); // Close notification dropdown when account dropdown is opened
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsAccountDropdownOpen(false); // Close account dropdown when notification dropdown is opened
  };

  const renderSidebarLinks = () => {
    switch (role) {
      case "admin":
        return (
          <>
            <li className="mb-2">
              <Link
                to="/dashboard/Admindashboard"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "Admindashboard"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaUsersCog className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/dashboard/roles"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "roles"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaUsersCog className="mr-3" />
                Role
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/dashboard/departments"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "departments"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaSitemap className="mr-3" />
                Departments
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/dashboard/employees"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "employees"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaUserPlus className="mr-3" />
                Employees
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/dashboard/password-reset"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "password-reset"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaLock className="mr-3" />
                Password Reset
              </Link>
            </li>
          </>
        );
      case "store-manager":
        return (
          <>
            <li className="mb-1">
              <Link
                to="/dashboard/StoreManagerDashboard"
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "StoreManagerDashboard"
                    ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaUsersCog className="mr-3 text-lg" />
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="mb-1">
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isStoreIssueVoucherOpen
                    ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => toggleDropdown("store-issue-voucher")}
                aria-expanded={isStoreIssueVoucherOpen}
              >
                <div className="flex items-center">
                  <FaClipboardList className="mr-3 text-lg" />
                  <span>Store Issue Voucher</span>
                </div>
                <FaChevronDown
                  className={`transition-transform duration-200 ${
                    isStoreIssueVoucherOpen ? "transform rotate-180" : ""
                  }`}
                />
              </div>

              <ul
                className={`pl-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                  isStoreIssueVoucherOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <li>
                  <Link
                    to="/dashboard/store-issue-voucher-input"
                    className={`flex items-center p-2 rounded-lg text-sm transition-all duration-200 ${
                      activeTab === "store-issue-voucher-input"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={handleSidebarLinkClick}
                  >
                    <FaFileAlt className="mr-3" />
                    <span>Issue Voucher</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/StoreIssueVoucherList"
                    className={`flex items-center p-2 rounded-lg text-sm transition-all duration-200 ${
                      activeTab === "StoreIssueVoucherList"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={handleSidebarLinkClick}
                  >
                    <FaEye className="mr-3" />
                    <span>View Voucher</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="mb-1">
              <Link
                to="/dashboard/ViewStockControlCard"
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "ViewStockControlCard"
                    ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxes className="mr-3 text-lg" />
                <span>Stock Control Card</span>
              </Link>
            </li>

            <li className="mb-1">
              <Link
                to="/dashboard/ViewReceivingGoods"
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTab === "ViewReceivingGoods"
                    ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxOpen className="mr-3 text-lg" />
                <span>View Latest GRN</span>
              </Link>
            </li>
          </>
        );

      case "store-keeper":
        return (
          <>
            <li className="mb-2">
              <Link
                to="/dashboard/good-receiving-input"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "good-receiving-input"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxOpen className="mr-3" />
                Register Receiving
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/dashboard/list-view"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "list-view"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxOpen className="mr-3" />
                View Receiving
              </Link>
            </li>
          </>
        );
      case "employee":
        return (
          <li className="mb-2">
            <div
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-gray-100 hover:shadow-md ${
                isRequestionOpen
                  ? "bg-gray-100 font-semibold shadow-md"
                  : "text-gray-700"
              }`}
              onClick={() => toggleDropdown("requestion")}
              aria-expanded={isRequestionOpen}
            >
              <div className="flex items-center">
                <FaClipboard className="mr-3" />
                Store Requestion
              </div>
              {isRequestionOpen ? <FaCaretUp /> : <FaCaretDown />}
            </div>
            {isRequestionOpen && (
              <ul className="pl-6 mt-2 space-y-2">
                <li>
                  <Link
                    to="/dashboard/RequisitionForm"
                    className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                      activeTab === "RequisitionForm"
                        ? "bg-gray-100 font-semibold shadow-md"
                        : "text-gray-700"
                    }`}
                    onClick={handleSidebarLinkClick}
                  >
                    <FaBoxOpen className="mr-3" />
                    Fill Requestion
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/StatusPage"
                    className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                      activeTab === "StatusPage"
                        ? "bg-gray-100 font-semibold shadow-md"
                        : "text-gray-700"
                    }`}
                    onClick={handleSidebarLinkClick}
                  >
                    <FaHistory className="mr-3" />
                    View Requestion
                  </Link>
                </li>
              </ul>
            )}
          </li>
        );
      case "department-head":
        return (
          <ul>
            <li>
              <Link
                to="/dashboard/DepartmentHeadDashboard"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "DepartmentHeadDashboard"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxOpen className="mr-3" />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard/RequisitionView"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md ${
                  activeTab === "RequisitionView"
                    ? "bg-gray-100 font-semibold shadow-md"
                    : "text-gray-700"
                }`}
                onClick={handleSidebarLinkClick}
              >
                <FaBoxOpen className="mr-3" />
                Requisition View
              </Link>
            </li>
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`w-64 bg-white text-gray-800 p-4 transform transition-transform duration-300 fixed lg:translate-x-0 h-screen z-20 overflow-y-auto shadow-lg ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">{role} Dashboard</h2>
          <button onClick={toggleSidebar} className="lg:hidden">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        <nav>
          <ul>{renderSidebarLinks()}</ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 lg:ml-64 overflow-y-auto h-screen">
        {/* Fixed Header */}
        <header className="bg-white shadow-lg p-4 fixed top-0 left-0 right-0 z-10 lg:left-64">
          <div className="flex justify-between items-center">
            <button onClick={toggleSidebar} className="lg:hidden">
              <FaBars className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-xl text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {user?.name || role}
                </span>
              </div>

              {/* Notification Dropdown */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                >
                  <FaBell className="text-xl text-blue-600" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    3
                  </span>
                </button>
                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Notifications
                      </h3>
                      <ul className="mt-2 space-y-2">
                        <li className="p-2 hover:bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            New goods received.
                          </p>
                          <span className="text-xs text-gray-500">
                            2 hours ago
                          </span>
                        </li>
                        <li className="p-2 hover:bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            Requisition approved.
                          </p>
                          <span className="text-xs text-gray-500">
                            5 hours ago
                          </span>
                        </li>
                        <li className="p-2 hover:bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            New voucher issued.
                          </p>
                          <span className="text-xs text-gray-500">
                            1 day ago
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
                >
                  <FaUserCircle className="text-xl text-blue-600" />
                </button>
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul>
                      <li>
                        <Link
                          to="/dashboard/MyProfile"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/dashboard/change-password"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="bg-white shadow-lg p-4 fixed bottom-0 left-0 right-0 z-10 lg:left-64">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 Store Management System. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/privacy-policy"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
