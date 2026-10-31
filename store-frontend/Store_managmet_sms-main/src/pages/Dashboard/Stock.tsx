import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaBoxOpen,
  FaBoxes,
  FaCoins,
  FaExclamationTriangle,
  FaMapPin,
  FaPlus,
  FaSearch,
  FaSlidersH,
  FaWarehouse,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { api, query } from "../../services/api";
import {
  ENDPOINTS,
  type StockMovement,
  type StockRow,
  type StockSummary,
} from "../../services/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  ProgressBar,
  Select,
  StatCard,
  Table,
  TableWrap,
  Tabs,
  Td,
  Textarea,
  Th,
  Tr,
  useToast,
} from "../../components/ui";
import {
  currency,
  errorMessage,
  formatDateTime,
  number,
  relativeTime,
  statusLabel,
  statusTone,
} from "../../lib/format";

type Tab = "balances" | "movements" | "low";

const Stock = () => {
  const { user } = useAuth();
  const toast = useToast();
  const role = user?.userRole ?? "employee";
  const canAdjust = role === "admin" || role === "store-manager";

  const [tab, setTab] = useState<Tab>("balances");
  const [rows, setRows] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustRow, setAdjustRow] = useState<StockRow | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    quantity: "",
    direction: "in" as "in" | "out",
    unitPrice: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [balances, stats, moves] = await Promise.all([
        api.get<StockRow[]>(`${ENDPOINTS.stock}${query({ search })}`),
        api.get<StockSummary>(`${ENDPOINTS.stock}/summary`),
        api.get<StockMovement[]>(`${ENDPOINTS.stock}/movements${query({ limit: 60 })}`),
      ]);
      setRows(balances);
      setSummary(stats);
      setMovements(moves);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.item.toLowerCase().includes(search.toLowerCase()) ||
        (row.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (row.locationName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (row.aisle ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (row.shelf ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (row.bin ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesLocation = !locationFilter || row.locationName === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [rows, search, locationFilter]);

  const lowRows = useMemo(
    () => rows.filter((row) => row.status !== "ok"),
    [rows]
  );

  const uniqueLocations = useMemo(() => {
    const locSet = new Set<string>();
    rows.forEach((row) => {
      if (row.locationName && row.locationName !== "—") {
        locSet.add(row.locationName);
      }
    });
    return Array.from(locSet).map((name) => ({ id: name, name }));
  }, [rows]);

  const openAdjust = (row: StockRow) => {
    setAdjustRow(row);
    setAdjustForm({
      quantity: "",
      direction: "in",
      unitPrice: String(row.unitPrice || ""),
      reason: "",
    });
    setAdjustOpen(true);
  };

  const submitAdjust = async () => {
    if (!adjustRow) return;
    const amount = Number(adjustForm.quantity);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a quantity greater than zero.");
      return;
    }
    if (adjustForm.reason.trim().length < 3) {
      toast.error("Please provide a reason for the adjustment.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`${ENDPOINTS.stock}/adjust`, {
        itemId: adjustRow.itemId ?? undefined,
        item: adjustRow.item,
        quantity: adjustForm.direction === "out" ? -amount : amount,
        unitPrice: adjustForm.unitPrice ? Number(adjustForm.unitPrice) : undefined,
        reason: adjustForm.reason.trim(),
      });
      toast.success(
        `Stock ${adjustForm.direction === "out" ? "reduced" : "added"} for ${adjustRow.item}.`
      );
      setAdjustOpen(false);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock overview"
        description="Live balances, valuation and every movement in and out of the store. Find items by location, aisle, shelf, or bin."
        icon={<FaWarehouse />}
        actions={
          <Button variant="secondary" icon={<FaSearch />} onClick={() => void load()} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Stock value"
          value={currency(summary?.totalValue)}
          hint={`${number(summary?.totalItems)} item types`}
          icon={<FaCoins />}
          tone="violet"
          loading={loading && !summary}
        />
        <StatCard
          label="Units on hand"
          value={number(summary?.totalUnits)}
          hint="Across all items"
          icon={<FaBoxes />}
          tone="blue"
          loading={loading && !summary}
        />
        <StatCard
          label="Low stock"
          value={number(summary?.lowStock)}
          hint="At or below reorder level"
          icon={<FaExclamationTriangle />}
          tone="amber"
          loading={loading && !summary}
        />
        <StatCard
          label="Out of stock"
          value={number(summary?.outOfStock)}
          hint="Needs replenishment"
          icon={<FaBoxOpen />}
          tone="red"
          loading={loading && !summary}
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Tabs value={tab} onChange={setTab} tabs={[
              { id: "balances", label: "Balances", count: rows.length },
              { id: "movements", label: "Movements", count: movements.length },
              { id: "low", label: "Low stock", count: lowRows.length },
            ]} />
          </div>
          {tab !== "movements" && (
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <FaMapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">All locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </Select>
              </div>
              <div className="relative w-64">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search item, category, aisle, shelf, bin…"
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </div>

        {loading && rows.length === 0 ? (
          <LoadingBlock label="Loading stock…" />
        ) : tab === "balances" ? (
          filteredRows.length === 0 ? (
            <EmptyState
              icon={<FaWarehouse />}
              title="No stock on hand"
              description="Approve a goods received note to post items into the store."
            />
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Item</Th>
                    <Th>Location</Th>
                    <Th className="text-center">Category</Th>
                    <Th className="text-right">On hand</Th>
                    <Th className="text-right">Unit cost</Th>
                    <Th className="text-right">Value</Th>
                    <Th>Level</Th>
                    <Th>Updated</Th>
                    {canAdjust && <Th></Th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const target = Math.max(row.reorderLevel * 2, row.quantity, 1);
                    const locDisplay = row.locationName !== "—"
                      ? `${row.locationName} ${row.aisle !== "—" ? `(${row.aisle}-${row.shelf}-${row.bin})` : ""}`
                      : row.location;
                    return (
                      <Tr key={row.sccId}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                              <FaBoxOpen />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-100">{row.item}</div>
                              <div className="text-xs text-slate-400 dark:text-slate-500">
                                {row.type} · {row.unit}
                              </div>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2 text-xs">
                            <FaMapPin className="text-slate-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{locDisplay}</span>
                            {row.category && row.category !== "—" && (
                              <Badge tone="blue">{row.category}</Badge>
                            )}
                          </div>
                        </Td>
                        <Td className="text-center text-xs text-slate-500 dark:text-slate-400">{row.category || "—"}</Td>
                        <Td className="text-right font-semibold">{number(row.quantity)}</Td>
                        <Td className="text-right">{currency(row.unitPrice)}</Td>
                        <Td className="text-right">{currency(row.totalValue)}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <ProgressBar value={(row.quantity / target) * 100} tone={row.status === "out" ? "red" : row.status === "low" ? "amber" : "green"} className="h-1.5 w-16" />
                            <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                          {row.updatedAt ? relativeTime(row.updatedAt) : "—"}
                        </Td>
                        {canAdjust && (
                          <Td>
                            <Button size="sm" variant="ghost" icon={<FaSlidersH />} onClick={() => openAdjust(row)}>Adjust</Button>
                          </Td>
                        )}
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrap>
          )
        ) : tab === "low" ? (
          lowRows.length === 0 ? (
            <EmptyState icon={<FaBoxes />} title="All stock levels healthy" description="No item is at or below its reorder level." />
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Item</Th>
                    <Th>Location</Th>
                    <Th className="text-center">Reorder at</Th>
                    <Th className="text-right">On hand</Th>
                    <Th>Status</Th>
                    {canAdjust && <Th></Th>}
                  </tr>
                </thead>
                <tbody>
                  {lowRows.map((row) => (
                    <Tr key={row.sccId}>
                      <Td>
                        <div className="font-medium text-slate-800 dark:text-slate-100">{row.item}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{row.type} · {row.unit}</div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 text-xs">
                          <FaMapPin className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{row.locationName !== "—" ? row.locationName : row.location}</span>
                        </div>
                      </Td>
                      <Td className="text-center text-right">{number(row.reorderLevel)}</Td>
                      <Td className="text-right font-semibold">{number(row.quantity)}</Td>
                      <Td><Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge></Td>
                      {canAdjust && (
                        <Td>
                          <Button size="sm" variant="ghost" icon={<FaPlus />} onClick={() => openAdjust(row)}>Replenish</Button>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )
        ) : movements.length === 0 ? (
          <EmptyState icon={<FaArrowDown />} title="No movements yet" description="Stock in and out entries will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {movements.map((move) => (
              <li key={move.id} className="flex items-start gap-3 px-4 py-3">
                <div className={move.direction === "IN"
                  ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"}>
                  {move.direction === "IN" ? <FaArrowDown /> : <FaArrowUp />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{move.item}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{move.reference} {move.supplier ? ` · ${move.supplier}` : ""} · {formatDateTime(move.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={move.direction === "IN" ? "text-sm font-semibold text-emerald-600 dark:text-emerald-400" : "text-sm font-semibold text-blue-600 dark:text-blue-400"}>
                    {move.direction === "IN" ? "+" : "−"} {number(move.quantity)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{currency(move.totalPrice)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust stock"
        description={adjustRow ? `${adjustRow.item} · ${number(adjustRow.quantity)} ${adjustRow.unit} on hand at ${adjustRow.locationName || adjustRow.location}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button onClick={() => void submitAdjust()} loading={saving}>Save adjustment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Direction" required>
            <Select value={adjustForm.direction} onChange={(e) => setAdjustForm((f) => ({ ...f, direction: e.target.value as "in" | "out" }))}>
              <option value="in">Add stock (receive)</option>
              <option value="out">Remove stock (write-off)</option>
            </Select>
          </Field>
          <Field label="Quantity" required>
            <Input type="number" min={1} value={adjustForm.quantity} onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 10" />
          </Field>
          {adjustForm.direction === "in" && (
            <Field label="Unit cost" hint="Used to update the weighted average cost.">
              <Input type="number" min={0} step="0.01" value={adjustForm.unitPrice} onChange={(e) => setAdjustForm((f) => ({ ...f, unitPrice: e.target.value }))} placeholder="0.00" />
            </Field>
          )}
          <Field label="Reason" required hint="Recorded in the audit trail.">
            <Textarea value={adjustForm.reason} onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Physical stocktake correction" />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default Stock;
