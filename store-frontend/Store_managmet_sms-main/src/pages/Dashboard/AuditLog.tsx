import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaFilter,
  FaHistory,
  FaSearch,
  FaSyncAlt,
  FaUserShield,
} from "react-icons/fa";
import { api, query } from "../../services/api";
import {
  ENDPOINTS,
  type AuditEntry,
  type AuditStats,
  type Paginated,
} from "../../services/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  PageHeader,
  Select,
  StatCard,
  Table,
  TableWrap,
  Td,
  Th,
  Tr,
} from "../../components/ui";
import { errorMessage, formatDateTime, relativeTime } from "../../lib/format";
import type { Tone } from "../../lib/format";

const ACTION_TONE: Record<string, Tone> = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
  LOGIN: "violet",
  LOGIN_FAILED: "red",
  GRN_CREATE: "green",
  GRN_APPROVE: "green",
  GRN_REJECT: "red",
  SRN_CREATE: "amber",
  SRN_APPROVE: "green",
  SRN_REJECT: "red",
  SIV_ISSUE: "blue",
  STOCK_ADJUST: "amber",
};

const ENTITY_OPTIONS = [
  "grn",
  "srn",
  "siv",
  "stock",
  "vendor",
  "employee",
  "auth",
];

const ACTION_OPTIONS = [
  "LOGIN",
  "LOGIN_FAILED",
  "CREATE",
  "UPDATE",
  "DELETE",
  "GRN_CREATE",
  "GRN_APPROVE",
  "GRN_REJECT",
  "SRN_CREATE",
  "SRN_APPROVE",
  "SRN_REJECT",
  "SIV_ISSUE",
  "STOCK_ADJUST",
];

const PAGE_SIZE = 25;

const AuditLog = () => {
  const [filters, setFilters] = useState({
    search: "",
    entity: "",
    action: "",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<AuditEntry> | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pageData, statsData] = await Promise.all([
        api.get<Paginated<AuditEntry>>(
          `${ENDPOINTS.auditLogs}${query({ ...filters, page, pageSize: PAGE_SIZE })}`
        ),
        api.get<AuditStats>(`${ENDPOINTS.auditLogs}/stats`),
      ]);
      setResult(pageData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search: "", entity: "", action: "", from: "", to: "" });
  };

  const activeFilters = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit trail"
        description="Every login, approval and stock movement recorded automatically."
        icon={<FaHistory />}
        actions={
          <Button
            variant="secondary"
            icon={<FaSyncAlt />}
            onClick={() => void load()}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total events"
          value={stats?.total ?? 0}
          icon={<FaHistory />}
          tone="blue"
          loading={loading && !stats}
        />
        <StatCard
          label="Last 7 days"
          value={stats?.last7Days ?? 0}
          icon={<FaSyncAlt />}
          tone="green"
          loading={loading && !stats}
        />
        <StatCard
          label="Most frequent action"
          value={stats?.byAction[0]?.action ?? "—"}
          hint={
            stats?.byAction[0]
              ? `${stats.byAction[0].count} events`
              : undefined
          }
          icon={<FaUserShield />}
          tone="violet"
          loading={loading && !stats}
        />
      </div>

      <Card padded={false}>
        <div className="border-b border-slate-100 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
              <FaFilter className="text-xs text-slate-400" /> Filters
              {activeFilters > 0 && <Badge tone="blue">{activeFilters}</Badge>}
            </div>
            {activeFilters > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Search">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <Input
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Description or user"
                  className="pl-8"
                />
              </div>
            </Field>
            <Field label="Entity">
              <Select
                value={filters.entity}
                onChange={(event) => updateFilter("entity", event.target.value)}
              >
                <option value="">All entities</option>
                {ENTITY_OPTIONS.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity.toUpperCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Action">
              <Select
                value={filters.action}
                onChange={(event) => updateFilter("action", event.target.value)}
              >
                <option value="">All actions</option>
                {ACTION_OPTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="From">
              <Input
                type="date"
                value={filters.from}
                onChange={(event) => updateFilter("from", event.target.value)}
              />
            </Field>
            <Field label="To">
              <Input
                type="date"
                value={filters.to}
                onChange={(event) => updateFilter("to", event.target.value)}
              />
            </Field>
          </div>
        </div>

        {loading && !result ? (
          <LoadingBlock label="Loading audit trail…" />
        ) : (result?.data.length ?? 0) === 0 ? (
          <EmptyState
            icon={<FaHistory />}
            title="No matching events"
            description="Try widening your filters or clearing the date range."
          />
        ) : (
          <>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>When</Th>
                    <Th>User</Th>
                    <Th>Action</Th>
                    <Th>Entity</Th>
                    <Th>Description</Th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.map((entry) => (
                    <Tr
                      key={entry.id}
                      className="cursor-pointer"
                    >
                      <Td>
                        <button
                          onClick={() => setSelected(entry)}
                          className="text-left"
                        >
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {formatDateTime(entry.createdAt)}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {relativeTime(entry.createdAt)}
                          </div>
                        </button>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {entry.employee_name ?? "System"}
                        </div>
                        {entry.role && (
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {entry.role}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={ACTION_TONE[entry.action] ?? "slate"}>
                          {entry.action.replace(/_/g, " ")}
                        </Badge>
                      </Td>
                      <Td>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {entry.entity}
                          {entry.entity_id ? ` #${entry.entity_id}` : ""}
                        </span>
                      </Td>
                      <Td>
                        <button
                          onClick={() => setSelected(entry)}
                          className="text-left text-sm text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                        >
                          {entry.description}
                        </button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-700 sm:flex-row">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {((result?.page ?? 1) - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    (result?.page ?? 1) * PAGE_SIZE,
                    result?.total ?? 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {result?.total ?? 0}
                </span>{" "}
                events
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<FaChevronLeft />}
                  disabled={(result?.page ?? 1) <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Page {result?.page ?? 1} of {Math.max(1, result?.pages ?? 1)}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={(result?.page ?? 1) >= (result?.pages ?? 1)}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next <FaChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-800 sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Audit event #{selected.id}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDateTime(selected.createdAt)}
                </p>
              </div>
              <Badge tone={ACTION_TONE[selected.action] ?? "slate"}>
                {selected.action.replace(/_/g, " ")}
              </Badge>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Description
                </dt>
                <dd className="text-slate-700 dark:text-slate-300">
                  {selected.description}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    User
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {selected.employee_name ?? "System"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Role
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {selected.role ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Entity
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {selected.entity}
                    {selected.entity_id ? ` #${selected.entity_id}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    IP address
                  </dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {selected.ip ?? "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Request
                  </dt>
                  <dd className="break-all text-slate-700 dark:text-slate-300">
                    {selected.method ? `${selected.method} ` : ""}
                    {selected.path ?? "—"}
                  </dd>
                </div>
              </div>
              {selected.metadata && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Metadata
                  </dt>
                  <dd>
                    <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
                      {JSON.stringify(selected.metadata, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
