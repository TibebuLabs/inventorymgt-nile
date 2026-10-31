import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiArrowRight,
  FiActivity,
  FiBox,
} from "react-icons/fi";
import {
  FaBuilding,
  FaUserShield,
  FaCheckCircle,
  FaBoxes,
  FaTags,
  FaRuler,
} from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";
import { ENDPOINTS } from "../../../services/endpoints";
import { useAuth } from "../../../context/AuthContext";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  to?: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bg, to, trend }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm
        ${to ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
        transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <span className={`text-lg ${color}`}>{icon}</span>
        </div>
        {to && (
          <FiArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors text-sm mt-1" />
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tabular-nums">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <FiTrendingUp className="text-emerald-500 text-xs" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );
};

interface AdminCounts {
  employees: number;
  departments: number;
  roles: number;
  grns: number;
  items: number;
  units: number;
  types: number;
}

const Admindashboard: React.FC = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<AdminCounts>({
    employees: 0,
    departments: 0,
    roles: 0,
    grns: 0,
    items: 0,
    units: 0,
    types: 0,
  });
  const [recentGrns, setRecentGrns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      http.get<any[]>(ENDPOINTS.employees),
      http.get<any[]>(ENDPOINTS.departments),
      http.get<any[]>(ENDPOINTS.roles),
      http.get<any[]>(ENDPOINTS.grn),
      http.get<any[]>(ENDPOINTS.items),
      http.get<any[]>(ENDPOINTS.unitMeasurements),
      http.get<any[]>(ENDPOINTS.itemTypes),
    ])
      .then(([emp, dep, rol, grn, itm, unt, typ]) => {
        const len = (r: PromiseSettledResult<any[]>) =>
          r.status === "fulfilled" && Array.isArray(r.value) ? r.value.length : 0;

        setCounts({
          employees: len(emp),
          departments: len(dep),
          roles: len(rol),
          grns: len(grn),
          items: len(itm),
          units: len(unt),
          types: len(typ),
        });

        if (grn.status === "fulfilled" && Array.isArray(grn.value)) {
          setRecentGrns(grn.value.slice(-5).reverse());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stats: StatCardProps[] = [
    {
      title: "Total Employees",
      value: loading ? "—" : counts.employees,
      icon: <FiUsers />,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      to: "/dashboard/employees",
      trend: "Active staff",
    },
    {
      title: "Inventory Items",
      value: loading ? "—" : counts.items,
      icon: <FiBox />,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-900/30",
      to: "/dashboard/inventory",
      trend: `${counts.types} types · ${counts.units} units`,
    },
    {
      title: "Departments",
      value: loading ? "—" : counts.departments,
      icon: <FaBuilding />,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      to: "/dashboard/departments",
    },
    {
      title: "Roles Defined",
      value: loading ? "—" : counts.roles,
      icon: <FaUserShield />,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/30",
      to: "/dashboard/roles",
    },
    {
      title: "Total GRNs",
      value: loading ? "—" : counts.grns,
      icon: <FiPackage />,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/30",
      to: "/dashboard/list-view",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-cyan-300/20 blur-xl" />
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-bold">{user?.fullname ?? "Administrator"}</h1>
          <p className="text-blue-100/90 text-sm mt-1">
            Here's what's happening in your store today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent GRNs — takes 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiPackage className="text-slate-400" />
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
                Recent Goods Receiving Notes
              </h2>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-full">
              Latest 5
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentGrns.length === 0 ? (
            <div className="py-14 text-center text-slate-400 dark:text-slate-500">
              <FiPackage className="mx-auto text-3xl mb-2" />
              <p className="text-sm">No GRNs yet</p>
              <p className="text-xs mt-1">Register a GRN to see it listed here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {recentGrns.map((grn: any) => (
                <div
                  key={grn.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                >
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPackage className="text-blue-500 dark:text-blue-400 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      GRN #{grn.id}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{grn.supplier}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {grn.date ? new Date(grn.date).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <FiActivity className="text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "Inventory Setup",
                icon: <FaBoxes />,
                to: "/dashboard/inventory",
                color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30",
              },
              {
                label: "Add Employee",
                icon: <FiUsers />,
                to: "/dashboard/employees",
                color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
              },
              {
                label: "Departments",
                icon: <FaBuilding />,
                to: "/dashboard/departments",
                color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
              },
              {
                label: "Manage Roles",
                icon: <FaUserShield />,
                to: "/dashboard/roles",
                color: "text-violet-600 bg-violet-50 dark:bg-violet-900/30",
              },
              {
                label: "Password Reset",
                icon: <FaCheckCircle />,
                to: "/dashboard/password-reset",
                color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
              },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
              >
                <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center text-sm`}>
                  {a.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                  {a.label}
                </span>
                <FiArrowRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-slate-500 text-xs transition" />
              </Link>
            ))}
          </div>

          {/* Inventory summary */}
          <div className="mx-4 mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Inventory Master Data
            </p>
            {[
              { label: "Registered items", value: counts.items, icon: <FaBoxes /> },
              { label: "Item types", value: counts.types, icon: <FaTags /> },
              { label: "Units of measure", value: counts.units, icon: <FaRuler /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">{s.icon}</span>
                  {s.label}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white tabular-nums">
                  {loading ? "—" : s.value}
                </span>
              </div>
            ))}
            <Link
              to="/dashboard/inventory"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              Manage inventory <FiArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
