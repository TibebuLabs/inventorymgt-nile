import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  FaBoxOpen, FaFileAlt, FaEye, FaBoxes, FaBell,
  FaChevronDown, FaBars, FaTimes, FaSignOutAlt,
  FaUsersCog, FaSitemap, FaUserPlus, FaLock,
  FaClipboard, FaHistory, FaTachometerAlt, FaFileInvoice,
  FaSearch, FaCog, FaMoon, FaSun,
  FaWarehouse, FaTruck, FaClipboardCheck,
  FaMapPin,
} from "react-icons/fa";

export type Role = "admin" | "store-manager" | "store-keeper" | "employee" | "department-head";

interface DashboardProps { role?: Role; }

interface NavChild { label: string; to: string; icon: React.ReactNode; }
interface NavItem  { label: string; icon: React.ReactNode; to?: string; children?: NavChild[]; }

const getNavItems = (role: Role): NavItem[] => {
  switch (role) {
    case "admin": return [
      { label: "Dashboard",       to: "/dashboard",                icon: <FaTachometerAlt /> },
      { label: "Approvals",       to: "/dashboard/approvals",      icon: <FaClipboardCheck /> },
      { label: "Stock Overview",  to: "/dashboard/stock",          icon: <FaWarehouse /> },
      { label: "Locations",       to: "/dashboard/locations",      icon: <FaMapPin /> },
      { label: "Vendors",         to: "/dashboard/vendors",        icon: <FaTruck /> },
      { label: "Audit Trail",     to: "/dashboard/audit",          icon: <FaHistory /> },
      { label: "Inventory Setup", to: "/dashboard/inventory",      icon: <FaBoxes /> },
      { label: "Employees",       to: "/dashboard/employees",      icon: <FaUserPlus /> },
      { label: "Departments",     to: "/dashboard/departments",    icon: <FaSitemap /> },
      { label: "Roles",           to: "/dashboard/roles",          icon: <FaUsersCog /> },
      { label: "Password Reset",  to: "/dashboard/password-reset", icon: <FaLock /> },
    ];
    case "store-keeper": return [
      { label: "Dashboard",       to: "/dashboard",                      icon: <FaTachometerAlt /> },
      { label: "Register GRN",    to: "/dashboard/good-receiving-input", icon: <FaBoxOpen /> },
      { label: "View GRNs",       to: "/dashboard/list-view",            icon: <FaEye /> },
      { label: "Stock Overview",  to: "/dashboard/stock",                icon: <FaWarehouse /> },
      { label: "Locations",       to: "/dashboard/locations",            icon: <FaMapPin /> },
      { label: "Vendors",         to: "/dashboard/vendors",              icon: <FaTruck /> },
      { label: "Inventory Setup", to: "/dashboard/inventory",            icon: <FaBoxes /> },
    ];
    case "store-manager": return [
      { label: "Dashboard",      to: "/dashboard",                   icon: <FaTachometerAlt /> },
      { label: "Approvals",      to: "/dashboard/approvals",         icon: <FaClipboardCheck /> },
      { label: "Stock Overview", to: "/dashboard/stock",             icon: <FaWarehouse /> },
      { label: "Locations",      to: "/dashboard/locations",         icon: <FaMapPin /> },
      { label: "Vendors",        to: "/dashboard/vendors",           icon: <FaTruck /> },
      { label: "Audit Trail",    to: "/dashboard/audit",             icon: <FaHistory /> },
      {
        label: "Store Issue Voucher", icon: <FaFileInvoice />,
        children: [
          { label: "Issue Voucher",  to: "/dashboard/store-issue-voucher-input", icon: <FaFileAlt /> },
          { label: "View Vouchers",  to: "/dashboard/StoreIssueVoucherList",     icon: <FaEye /> },
        ],
      },
      { label: "Stock Control Card", to: "/dashboard/ViewStockControlCard", icon: <FaBoxes /> },
      { label: "View GRNs",          to: "/dashboard/list-view",            icon: <FaBoxOpen /> },
    ];
    case "employee": return [
      { label: "Dashboard", to: "/dashboard", icon: <FaTachometerAlt /> },
      {
        label: "Store Requisition", icon: <FaClipboard />,
        children: [
          { label: "New Requisition", to: "/dashboard/RequisitionForm", icon: <FaFileAlt /> },
          { label: "My Requests",     to: "/dashboard/requests",        icon: <FaHistory /> },
        ],
      },
    ];
    case "department-head": return [
      { label: "Dashboard",           to: "/dashboard",                       icon: <FaTachometerAlt /> },
      { label: "Approvals",           to: "/dashboard/approvals",             icon: <FaClipboardCheck /> },
      { label: "Requisition Review",  to: "/dashboard/RequisitionView",       icon: <FaClipboard /> },
      { label: "Stock Overview",      to: "/dashboard/stock",                 icon: <FaWarehouse /> },
    ];
    default: return [];
  }
};

/* ── Single nav item ──────────────────────────────────────────────────────── */
const NavItemEl = ({ item, active, onClose }: { item: NavItem; active: string; onClose: () => void }) => {
  const [open, setOpen] = useState(false);
  const isActiveParent = item.children?.some(c => c.to.split("/").pop() === active);

  if (item.children) return (
    <li>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          ${isActiveParent ? "bg-teal-600/30 dark:bg-teal-600/30 text-white dark:text-teal-100" : "text-teal-100 dark:text-teal-200 hover:bg-teal-700 dark:hover:bg-teal-700 hover:text-white dark:hover:text-white"}`}
      >
        <span className="flex items-center gap-3">
          <span className="text-base">{item.icon}</span>{item.label}
        </span>
        <FaChevronDown className={`text-xs transition-transform ${open || isActiveParent ? "rotate-180" : ""}`} />
      </button>
      <ul className={`ml-6 mt-0.5 space-y-0.5 overflow-hidden transition-all duration-200
        ${open || isActiveParent ? "max-h-40" : "max-h-0"}`}>
        {item.children.map(c => (
          <li key={c.to}>
            <Link to={c.to} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                ${active === c.to.split("/").pop()
                  ? "bg-teal-600 text-white font-medium shadow-sm shadow-teal-900/30"
                  : "text-teal-100 dark:text-teal-200 hover:bg-teal-700 dark:hover:bg-teal-700 hover:text-white dark:hover:text-white"}`}>
              <span className="text-xs">{c.icon}</span>{c.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );

  const slug = item.to?.split("/").pop();
  const isActive = active === slug;
  return (
    <li>
      <Link to={item.to!} onClick={onClose}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          ${isActive
            ? "bg-teal-600 text-white shadow-sm shadow-teal-900/30"
            : "text-teal-100 dark:text-teal-200 hover:bg-teal-700 dark:hover:bg-teal-700 hover:text-white dark:hover:text-white"}`}>
        <span className="text-base">{item.icon}</span>{item.label}
      </Link>
    </li>
  );
};

/* ── Dashboard ────────────────────────────────────────────────────────────── */
const Dashboard: React.FC<DashboardProps> = ({ role: roleProp }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const role: Role = roleProp ?? ((user?.userRole as Role) ?? "employee");
  const location = useLocation();
  const [active, setActive]   = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);
  const navItems   = getNavItems(role);

  const roleLabels: Record<Role, string> = {
    admin: "Administrator", "store-manager": "Store Manager",
    "store-keeper": "Store Keeper", employee: "Employee",
    "department-head": "Department Head",
  };

  useEffect(() => {
    setActive(location.pathname.split("/").pop() || "");
  }, [location]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const pageTitle = active.replace(/-/g, " ").replace(/([A-Z])/g, " $1").trim() || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════════ SIDEBAR ════════════════════════════ */}
      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-teal-800 dark:bg-teal-900 border-r border-teal-700 dark:border-teal-800
        flex flex-col transition-transform duration-300 ease-in-out shadow-xl shadow-teal-900/50 dark:shadow-teal-900/50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto lg:shadow-none`}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-teal-700 dark:border-teal-800 flex-shrink-0 bg-teal-700 dark:bg-teal-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/30 border border-white/30">
              <FaBoxes className="text-white text-sm" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">Nile Insurance</p>
              <p className="text-teal-100 text-xs mt-0.5">Store System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition">
            <FaTimes />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 my-3 p-3 bg-teal-700 dark:bg-teal-800 rounded-xl border border-teal-600 dark:border-teal-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/25 backdrop-blur-xl rounded-full flex items-center justify-center
              text-white font-bold text-sm flex-shrink-0 shadow-md border border-white/20">
              {user?.fullname?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.fullname ?? "User"}</p>
              <p className="text-teal-100 text-xs truncate">{roleLabels[role]}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-1">
          <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider px-3 mb-2">Menu</p>
          <ul className="space-y-0.5">
            {navItems.map(item => (
              <NavItemEl key={item.label} item={item} active={active} onClose={() => setSidebarOpen(false)} />
            ))}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-teal-700 dark:border-teal-800 flex-shrink-0">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-teal-100 dark:text-teal-200 hover:bg-red-600/20 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all group">
            <FaSignOutAlt className="text-base group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════ MAIN ═══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ───────────────────────────────────────────── */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center
          px-4 lg:px-6 gap-4 flex-shrink-0 z-20 transition-colors duration-300">

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <FaBars />
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:flex items-center flex-1 max-w-sm">
            <FaSearch className="absolute left-3 text-slate-400 dark:text-slate-500 text-xs" />
            <input type="text" placeholder="Search..."
              className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-700 focus:border-transparent
                placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-300 transition" />
          </div>

          {/* Page title (mobile) */}
          <h1 className="sm:hidden font-semibold text-slate-800 dark:text-white capitalize text-sm truncate flex-1">
            {pageTitle}
          </h1>

          <div className="ml-auto flex items-center gap-2">

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(o => !o); setAccountOpen(false); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl
                  text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center
                    text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-800">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl
                  shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-50 dark:divide-slate-700 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-8 text-center">
                        <FaBell className="mx-auto text-slate-300 dark:text-slate-600 text-2xl mb-2" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet</p>
                      </li>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <li
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                          }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition
                            ${!n.read ? "bg-teal-50/50 dark:bg-teal-900/10" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5
                            ${n.grn_id ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}>
                            {n.grn_id ? <FaBoxOpen /> : <FaFileAlt />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? "font-medium text-slate-800 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {n.timestamp ? new Date(n.timestamp).toLocaleString() : n.date}
                            </p>
                          </div>
                          {!n.read && (
                            <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
                    <span className="text-xs text-slate-400 dark:text-slate-500">Real-time notifications active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-600" />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <FaMoon className="text-sm" /> : <FaSun className="text-sm" />}
            </button>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <button onClick={() => { setAccountOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center
                  text-white text-xs font-bold shadow-sm shadow-teal-200">
                  {user?.fullname?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white leading-none">
                    {user?.fullname?.split(" ")[0] ?? "User"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{roleLabels[role]}</p>
                </div>
                <FaChevronDown className={`text-xs text-slate-400 dark:text-slate-500 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl
                  shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.fullname}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400
                      text-xs rounded-full font-medium">{roleLabels[role]}</span>
                  </div>
                  <div className="p-1">
                    <button onClick={toggleTheme}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                        text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      {theme === "light" ? <FaMoon className="text-slate-400 dark:text-slate-500" /> : <FaSun className="text-slate-400 dark:text-slate-500" />}
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </button>
                    <button onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                        text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <FaCog className="text-slate-400 dark:text-slate-500" /> Settings
                    </button>
                    <button onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                        text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Breadcrumb bar ─────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 transition-colors duration-300">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">{pageTitle.replace(/([A-Z])/g, ' $1').trim()}</span>
        </div>

        {/* ── Page content ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="p-5 lg:p-7 max-w-7xl mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
