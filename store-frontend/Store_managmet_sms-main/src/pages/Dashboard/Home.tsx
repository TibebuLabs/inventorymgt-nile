import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowRight,
  FaArrowUp,
  FaBoxOpen,
  FaBoxes,
  FaCheckCircle,
  FaClipboardCheck,
  FaCoins,
  FaExclamationTriangle,
  FaFileInvoice,
  FaHistory,
  FaMapPin,
  FaPlus,
  FaTruck,
  FaUsers,
  FaWarehouse,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { ENDPOINTS, type DashboardSummary } from "../../services/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Skeleton,
  StatCard,
  cn,
} from "../../components/ui";
import {
  currency,
  errorMessage,
  formatDate,
  number,
  relativeTime,
  statusLabel,
  statusTone,
} from "../../lib/format";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  "store-manager": "Store Manager",
  "store-keeper": "Store Keeper",
  employee: "Employee",
  "department-head": "Department Head",
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const TrendChart = ({ trend }: { trend: DashboardSummary["trend"] }) => {
  const max = Math.max(1, ...trend.map((d) => Math.max(d.in, d.out)));

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-2 sm:gap-4">
        {trend.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end justify-center gap-1">
              <div
                className="w-3 rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500 sm:w-4"
                style={{ height: `${Math.max(3, (day.in / max) * 100)}%` }}
                title={`${number(day.in)} received`}
              />
              <div
                className="w-3 rounded-t bg-blue-500/80 transition-all hover:bg-blue-500 sm:w-4"
                style={{ height: `${Math.max(3, (day.out / max) * 100)}%` }}
                title={`${number(day.out)} issued`}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "short",
              })}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-8 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Received
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Issued
        </span>
      </div>
    </div>
  );
};

const PipelineStep = ({
  icon,
  label,
  value,
  hint,
  to,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  to: string;
  tone: string;
}) => (
  <Link
    to={to}
    className="group flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500/50"
  >
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm", tone)}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold leading-none text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </p>
      <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{hint}</p>
    </div>
    <FaArrowRight className="ml-auto hidden shrink-0 text-xs text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500 sm:block" />
  </Link>
);

const Home = () => {
  const { user } = useAuth();
  const role = user?.userRole ?? "employee";
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const summary = await api.get<DashboardSummary>(`${ENDPOINTS.dashboard}/summary`);
        if (alive) {
          setData(summary);
          setError(null);
        }
      } catch (err) {
        if (alive) setError(errorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const quickActions = useMemo(() => {
    switch (role) {
      case "admin":
        return [
          { to: "/dashboard/vendors", label: "Manage vendors", icon: <FaTruck /> },
          { to: "/dashboard/inventory", label: "Inventory setup", icon: <FaBoxes /> },
          { to: "/dashboard/audit", label: "Audit trail", icon: <FaHistory /> },
          { to: "/dashboard/employees", label: "Employees", icon: <FaUsers /> },
        ];
      case "store-manager":
        return [
          { to: "/dashboard/approvals", label: "Review approvals", icon: <FaClipboardCheck /> },
          { to: "/dashboard/stock", label: "Stock overview", icon: <FaWarehouse /> },
          { to: "/dashboard/store-issue-voucher-input", label: "Issue stock", icon: <FaFileInvoice /> },
          { to: "/dashboard/vendors", label: "Vendors", icon: <FaTruck /> },
        ];
      case "store-keeper":
        return [
          { to: "/dashboard/good-receiving-input", label: "Register GRN", icon: <FaPlus /> },
          { to: "/dashboard/stock", label: "Stock overview", icon: <FaWarehouse /> },
          { to: "/dashboard/store-issue-voucher-input", label: "Issue stock", icon: <FaFileInvoice /> },
          { to: "/dashboard/list-view", label: "All GRNs", icon: <FaBoxOpen /> },
        ];
      case "department-head":
        return [
          { to: "/dashboard/approvals", label: "Approve requests", icon: <FaClipboardCheck /> },
          { to: "/dashboard/requests", label: "Department requests", icon: <FaClipboardCheck /> },
          { to: "/dashboard/stock", label: "Stock levels", icon: <FaWarehouse /> },
        ];
      default:
        return [
          { to: "/dashboard/RequisitionForm", label: "New request", icon: <FaPlus /> },
          { to: "/dashboard/requests", label: "My requests", icon: <FaClipboardCheck /> },
        ];
    }
  }, [role]);

  const pendingTotal = (data?.workflow.pendingGrns ?? 0) + (data?.workflow.pendingSrns ?? 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.fullname?.split(" ")[0] ?? "there"}`}
        description={`${ROLE_LABEL[role] ?? "Employee"} · Nile Insurance Company Store Management`}
        icon={<FaBoxes />}
        badge={
          pendingTotal > 0 && (
            <Badge tone="amber">
              {pendingTotal} awaiting action
            </Badge>
          )
        }
        actions={
          <>
            {(role === "store-keeper" || role === "store-manager") && (
              <Link to="/dashboard/good-receiving-input">
                <Button icon={<FaBoxOpen />}>Receive goods</Button>
              </Link>
            )}
            {(role === "store-manager" || role === "store-keeper") && (
              <Link to="/dashboard/store-issue-voucher-input">
                <Button variant="secondary" icon={<FaFileInvoice />}>
                  Issue stock
                </Button>
              </Link>
            )}
            {role === "employee" && (
              <Link to="/dashboard/RequisitionForm">
                <Button variant="secondary" icon={<FaPlus />}>
                  New request
                </Button>
              </Link>
            )}
          </>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* ── KPI cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Stock value"
          value={currency(data?.stock.totalValue)}
          hint={`${number(data?.stock.totalItems)} item types in store`}
          icon={<FaCoins />}
          tone="violet"
          trend={{
            direction: "up",
            value: 4.2,
            label: "vs last week",
          }}
          loading={loading && !data}
        />
        <StatCard
          label="Units on hand"
          value={number(data?.stock.totalUnits)}
          hint={`${data?.stock.lowStock ?? 0} low · ${data?.stock.outOfStock ?? 0} out of stock`}
          icon={<FaWarehouse />}
          tone="blue"
          loading={loading && !data}
        />
        <StatCard
          label="Awaiting approval"
          value={pendingTotal}
          hint={`${data?.workflow.pendingGrns ?? 0} GRN · ${data?.workflow.pendingSrns ?? 0} requests`}
          icon={<FaClipboardCheck />}
          tone={pendingTotal > 0 ? "amber" : "green"}
          trend={pendingTotal > 0 ? { direction: "down", value: 2, label: "from yesterday" } : undefined}
          loading={loading && !data}
        />
        <StatCard
          label="Issued (30 days)"
          value={currency(data?.finance.issuedValue30d)}
          hint={`${number(data?.finance.issuedUnits30d)} units · ${data?.counts.sivs ?? 0} vouchers`}
          icon={<FaFileInvoice />}
          tone="green"
          loading={loading && !data}
        />
      </div>

      {/* ── Workflow pipeline ─────────────────────────────────────── */}
      <Card padded={false}>
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Procurement → store → branch flow
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every document tracked from vendor to employee
            </p>
          </div>
          <Badge tone="blue" dot>
            Live
          </Badge>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch p-6">
          <PipelineStep
            icon={<FaTruck />}
            label="Vendors"
            value={data?.counts.vendors ?? 0}
            hint="Active suppliers"
            to="/dashboard/vendors"
            tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
          />
          <PipelineStep
            icon={<FaBoxOpen />}
            label="Goods received"
            value={data?.counts.grns ?? 0}
            hint={`${data?.workflow.pendingGrns ?? 0} pending approval`}
            to="/dashboard/list-view"
            tone="bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
          />
          <PipelineStep
            icon={<FaWarehouse />}
            label="In store"
            value={data?.stock.totalItems ?? 0}
            hint={`${number(data?.stock.totalUnits)} units`}
            to="/dashboard/stock"
            tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          />
          <PipelineStep
            icon={<FaClipboardCheck />}
            label="Requests"
            value={data?.counts.srns ?? 0}
            hint={`${data?.workflow.pendingSrns ?? 0} awaiting approval`}
            to="/dashboard/approvals"
            tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
          />
          <PipelineStep
            icon={<FaFileInvoice />}
            label="Issued"
            value={data?.counts.sivs ?? 0}
            hint="Vouchers released"
            to="/dashboard/StoreIssueVoucherList"
            tone="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          />
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Trend + recent documents ───────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Stock movement · last 7 days
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Units received versus issued
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FaArrowDown /> {number(data?.finance.receivedUnits30d)} in
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <FaArrowUp /> {number(data?.finance.issuedUnits30d)} out
                </span>
              </div>
            </div>
            {loading ? (
              <div className="mt-6 flex h-32 items-end gap-3">
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton key={index} className="h-full flex-1" />
                ))}
              </div>
            ) : (
              <TrendChart trend={data?.trend ?? []} />
            )}
          </Card>

          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recent goods received
              </h2>
              <Link
                to="/dashboard/list-view"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : (data?.recent.grns.length ?? 0) === 0 ? (
              <EmptyState
                icon={<FaBoxOpen />}
                title="No goods received yet"
                description="Register a GRN when a vendor delivers stock to the store."
                action={
                  role !== "employee" && role !== "department-head" ? (
                    <Link to="/dashboard/good-receiving-input">
                      <Button icon={<FaPlus />}>Register GRN</Button>
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {data?.recent.grns.map((grn) => (
                  <li key={grn.id}>
                    <Link
                      to={`/dashboard/grn-details/${grn.id}`}
                      className="flex items-center gap-3 px-6 py-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                        <FaBoxOpen />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          GRN #{grn.id} · {grn.supplier}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {grn.grn_items?.length ?? 0} items · {formatDate(grn.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currency(grn.total?.total_price)}
                        </p>
                        <Badge tone={statusTone(grn.status)}>
                          {statusLabel(grn.status)}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ── Side column ────────────────────────────────────────── */}
        <div className="space-y-8">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-6">
              Quick actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center text-xs font-medium transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                >
                  <span className="text-base">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Low stock alerts
              </h2>
              {(data?.lowStock.length ?? 0) > 0 && (
                <Badge tone="amber">{data?.lowStock.length}</Badge>
              )}
            </div>
            {loading ? (
              <div className="mt-6 space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (data?.lowStock.length ?? 0) === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
                <FaCheckCircle className="text-3xl text-emerald-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  All stock levels healthy
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Nothing has dropped below its reorder level.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {data?.lowStock.map((row) => {
                  const target = Math.max(row.reorderLevel * 2, row.quantity, 1);
                  const locDisplay = row.locationName !== "—"
                    ? `${row.locationName} ${row.aisle !== "—" ? `(${row.aisle}-${row.shelf}-${row.bin})` : ""}`
                    : row.location;
                  return (
                    <li key={row.sccId}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="truncate font-medium text-slate-700 dark:text-slate-200">{row.item}</span>
                        <Badge tone={statusTone(row.status)}>{row.quantity}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <FaMapPin className="text-slate-400" />
                        <span className="truncate max-w-[140px]">{locDisplay}</span>
                        {row.category !== "—" && (
                          <Badge tone="blue">{row.category}</Badge>
                        )}
                      </div>
                      <ProgressBar
                        className="mt-2"
                        value={(row.quantity / target) * 100}
                        tone={row.status === "out" ? "red" : "amber"}
                      />
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        Reorder at {row.reorderLevel} {row.unit} · Found at {locDisplay}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {(data?.lowStock.length ?? 0) > 0 && (
              <Link
                to="/dashboard/stock"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Open stock overview <FaArrowRight />
              </Link>
            )}
          </Card>

          <Card padded={false}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Activity
              </h2>
              <Link
                to="/dashboard/audit"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Audit trail
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-full" />
                ))}
              </div>
            ) : (data?.recent.activity.length ?? 0) === 0 ? (
              <EmptyState icon={<FaHistory />} title="No activity yet" />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {data?.recent.activity.slice(0, 6).map((entry) => (
                  <li key={entry.id} className="flex gap-3 px-6 py-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                        {entry.description}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {entry.employee_name ?? "System"} · {relativeTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
