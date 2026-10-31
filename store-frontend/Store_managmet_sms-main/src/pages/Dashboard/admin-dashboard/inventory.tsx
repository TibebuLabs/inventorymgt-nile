/**
 * Inventory Setup
 * ---------------
 * One place to manage the master data every other form depends on:
 *   • Items            (name + item type + unit of measurement)
 *   • Units of measure (Piece, Box, Ream, …)
 *   • Item types       (Electronics, Stationery, …)
 *
 * Everything is persisted through the NestJS API, so GRN / SIV / SRN forms
 * immediately pick up new records.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBox,
  FaTags,
  FaRuler,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaSpinner,
  FaLayerGroup,
  FaChevronRight,
} from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";
import {
  ENDPOINTS,
  InventoryItem,
  InventoryItemType,
  InventoryUnit,
} from "../../../services/endpoints";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

type Tab = "items" | "units" | "types";
type ToastKind = "success" | "error";

interface Toast {
  kind: ToastKind;
  text: string;
}

interface ConfirmTarget {
  entity: "item" | "unit" | "type";
  id: number;
  label: string;
}

interface ItemForm {
  id?: number;
  name: string;
  typeId: number;
  unitId: number;
}

/* ─────────────────────────── small UI helpers ─────────────────────────── */

const ToastBanner = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => (
  <div
    className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm shadow-sm transition-all
      ${
        toast.kind === "success"
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
      }`}
  >
    {toast.kind === "success" ? (
      <FaCheckCircle className="mt-0.5 flex-shrink-0" />
    ) : (
      <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
    )}
    <span className="flex-1">{toast.text}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100 transition">
      <FaTimes className="text-xs" />
    </button>
  </div>
);

const StatCard = ({
  label,
  value,
  hint,
  icon,
  tint,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
  tint: string;
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
    </div>
    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>
  </div>
);

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 page-enter">
      <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 " +
  "text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

const labelClass = "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5";

/* ─────────────────────────────── component ─────────────────────────────── */

const InventorySetup: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [types, setTypes] = useState<InventoryItemType[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);

  const [tab, setTab] = useState<Tab>("items");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");

  const [itemForm, setItemForm] = useState<ItemForm | null>(null);
  const [simpleForm, setSimpleForm] = useState<
    { entity: "unit" | "type"; id?: number; value: string } | null
  >(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

  const notify = useCallback((kind: ToastKind, text: string) => {
    setToast({ kind, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── data loading ─────────────────────────────────────────────────────── */

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemData, typeData, unitData] = await Promise.all([
        http.get<InventoryItem[]>(ENDPOINTS.items),
        http.get<InventoryItemType[]>(ENDPOINTS.itemTypes),
        http.get<InventoryUnit[]>(ENDPOINTS.unitMeasurements),
      ]);
      setItems(Array.isArray(itemData) ? itemData : []);
      setTypes(Array.isArray(typeData) ? typeData : []);
      setUnits(Array.isArray(unitData) ? unitData : []);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not load inventory data.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  /* ── derived data ─────────────────────────────────────────────────────── */

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.type?.type ?? "").toLowerCase().includes(q) ||
        (item.unit_measurement?.unit ?? "").toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.type_id === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [items, query, typeFilter]);

  const typeCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of items) {
      map.set(item.type_id, (map.get(item.type_id) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const unitCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of items) {
      map.set(item.unit_measurement_id, (map.get(item.unit_measurement_id) ?? 0) + 1);
    }
    return map;
  }, [items]);

  /* ── mutations ────────────────────────────────────────────────────────── */

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm) return;

    const name = itemForm.name.trim();
    if (!name) return notify("error", "Item name is required.");
    if (!itemForm.typeId) return notify("error", "Please choose an item type.");
    if (!itemForm.unitId) return notify("error", "Please choose a unit of measurement.");

    setSaving(true);
    try {
      const payload = {
        name,
        type_id: Number(itemForm.typeId),
        unitMeasurement_id: Number(itemForm.unitId),
      };

      if (itemForm.id) {
        await http.put<InventoryItem>(`${ENDPOINTS.items}/${itemForm.id}`, payload);
        notify("success", `“${name}” updated.`);
      } else {
        await http.post<InventoryItem>(ENDPOINTS.items, payload);
        notify("success", `“${name}” registered successfully.`);
      }
      setItemForm(null);
      await loadAll();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not save the item.");
    } finally {
      setSaving(false);
    }
  };

  const saveSimple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simpleForm) return;

    const value = simpleForm.value.trim();
    if (!value) return notify("error", "Please enter a value.");

    const isUnit = simpleForm.entity === "unit";
    const path = isUnit ? ENDPOINTS.unitMeasurements : ENDPOINTS.itemTypes;
    const field = isUnit ? "unit" : "type";

    setSaving(true);
    try {
      if (simpleForm.id) {
        await http.put(`${path}/${simpleForm.id}`, { [field]: value });
        notify("success", `${isUnit ? "Unit" : "Item type"} updated.`);
      } else {
        await http.post(path, { [field]: value });
        notify("success", `${isUnit ? "Unit" : "Item type"} “${value}” added.`);
      }
      setSimpleForm(null);
      await loadAll();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not save your change.");
    } finally {
      setSaving(false);
    }
  };

  const removeEntity = async () => {
    if (!confirmTarget) return;
    const { entity, id } = confirmTarget;
    const path =
      entity === "item"
        ? ENDPOINTS.items
        : entity === "unit"
        ? ENDPOINTS.unitMeasurements
        : ENDPOINTS.itemTypes;

    setSaving(true);
    try {
      await http.delete(`${path}/${id}`);
      notify("success", "Deleted successfully.");
      setConfirmTarget(null);
      await loadAll();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not delete this record.");
    } finally {
      setSaving(false);
    }
  };

  const itemCountForType = (typeId: number) => typeCounts.get(typeId) ?? 0;
  const itemCountForUnit = (unitId: number) => unitCounts.get(unitId) ?? 0;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "items", label: "Items", icon: <FaBox />, count: items.length },
    { key: "units", label: "Units", icon: <FaRuler />, count: units.length },
    { key: "types", label: "Item Types", icon: <FaTags />, count: types.length },
  ];

  /* ── render ───────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-7 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-4 bottom-0 w-32 h-32 rounded-full bg-cyan-300/20 blur-xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
              Nile Insurance · Store
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Inventory Setup</h1>
            <p className="text-blue-100/90 text-sm mt-1.5 max-w-xl">
              Register the items and units of measurement used across GRN, SIV and
              requisition forms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadAll()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium backdrop-blur transition disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {toast && <ToastBanner toast={toast} onClose={() => setToast(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Registered Items"
          value={loading ? "—" : items.length}
          hint="Available in every voucher form"
          icon={<FaBox className="text-blue-600" />}
          tint="bg-blue-50 dark:bg-blue-900/30"
        />
        <StatCard
          label="Units of Measurement"
          value={loading ? "—" : units.length}
          hint="Piece, Box, Ream, Litre…"
          icon={<FaRuler className="text-emerald-600" />}
          tint="bg-emerald-50 dark:bg-emerald-900/30"
        />
        <StatCard
          label="Item Types"
          value={loading ? "—" : types.length}
          hint="Used to group your catalogue"
          icon={<FaLayerGroup className="text-violet-600" />}
          tint="bg-violet-50 dark:bg-violet-900/30"
        />
      </div>

      {/* Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Tabs + primary action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
                  ${
                    tab === t.key
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
              >
                <span className="text-xs">{t.icon}</span>
                {t.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${
                      tab === t.key
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                    }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="sm:ml-auto">
            {tab === "items" ? (
              <button
                onClick={() =>
                  setItemForm({
                    name: "",
                    typeId: types[0]?.id ?? 0,
                    unitId: units[0]?.id ?? 0,
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition"
              >
                <FaPlus className="text-xs" /> Add Item
              </button>
            ) : (
              <button
                onClick={() =>
                  setSimpleForm({ entity: tab === "units" ? "unit" : "type", value: "" })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition"
              >
                <FaPlus className="text-xs" />
                {tab === "units" ? "Add Unit" : "Add Item Type"}
              </button>
            )}
          </div>
        </div>

        {/* ── ITEMS TAB ─────────────────────────────────────────────────── */}
        {tab === "items" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-5 py-3 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search items by name, type or unit…"
                  className={`${inputClass} pl-9`}
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className={`${inputClass} sm:w-56`}
              >
                <option value="all">All item types</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.type}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <FaSpinner className="animate-spin text-2xl mb-3" />
                <p className="text-sm">Loading inventory…</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <FaBox className="text-slate-400 dark:text-slate-500 text-xl" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {items.length === 0 ? "No items registered yet" : "No items match your search"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {items.length === 0
                    ? "Add your first item to make GRN, SIV and requisition forms usable."
                    : "Try a different keyword or clear the type filter."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3 font-semibold">Item</th>
                        <th className="px-5 py-3 font-semibold">Type</th>
                        <th className="px-5 py-3 font-semibold">Unit</th>
                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <FaBox className="text-blue-600 dark:text-blue-400 text-xs" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                  #{item.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/25 text-violet-700 dark:text-violet-300 text-xs font-medium">
                              <FaTags className="text-[10px]" />
                              {item.type?.type ?? `Type ${item.type_id}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                            {item.unit_measurement?.unit ?? `Unit ${item.unit_measurement_id}`}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  setItemForm({
                                    id: item.id,
                                    name: item.name,
                                    typeId: item.type_id,
                                    unitId: item.unit_measurement_id,
                                  })
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                                title="Edit item"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmTarget({ entity: "item", id: item.id, label: item.name })
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                title="Delete item"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <FaBox className="text-blue-600 dark:text-blue-400 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/25 text-violet-700 dark:text-violet-300 text-[11px] font-medium">
                              <FaTags className="text-[9px]" />
                              {item.type?.type ?? `Type ${item.type_id}`}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                              <FaRuler className="text-[9px]" />
                              {item.unit_measurement?.unit ?? `Unit ${item.unit_measurement_id}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setItemForm({
                                id: item.id,
                                name: item.name,
                                typeId: item.type_id,
                                unitId: item.unit_measurement_id,
                              })
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmTarget({ entity: "item", id: item.id, label: item.name })
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
                  Showing {filteredItems.length} of {items.length} items
                </div>
              </>
            )}
          </div>
        )}

        {/* ── UNITS / TYPES TAB ─────────────────────────────────────────── */}
        {(tab === "units" || tab === "types") && (
          <div>
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <FaSpinner className="animate-spin text-2xl mb-3" />
                <p className="text-sm">Loading…</p>
              </div>
            ) : (tab === "units" ? units : types).length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nothing here yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Use the button above to add your first entry.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {(tab === "units" ? units : types).map((entry) => {
                  const isUnit = tab === "units";
                  const count = isUnit
                    ? itemCountForUnit(entry.id)
                    : itemCountForType(entry.id);
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUnit
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                        }`}
                      >
                        {isUnit ? <FaRuler className="text-xs" /> : <FaTags className="text-xs" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                          {isUnit
                            ? (entry as InventoryUnit).unit
                            : (entry as InventoryItemType).type}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {count} {count === 1 ? "item" : "items"} linked
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setSimpleForm({
                              entity: isUnit ? "unit" : "type",
                              id: entry.id,
                              value: isUnit
                                ? (entry as InventoryUnit).unit
                                : (entry as InventoryItemType).type,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                          title="Rename"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmTarget({
                              entity: isUnit ? "unit" : "type",
                              id: entry.id,
                              label: isUnit
                                ? (entry as InventoryUnit).unit
                                : (entry as InventoryItemType).type,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 px-1">
        <FaChevronRight className="mt-0.5 text-[10px]" />
        <p>
          Items registered here appear immediately in{" "}
          <span className="font-medium text-slate-500 dark:text-slate-400">
            Register GRN, Store Issue Voucher and Store Requisition
          </span>{" "}
          forms.
        </p>
      </div>

      {/* ── Item modal ─────────────────────────────────────────────────── */}
      {itemForm && (
        <Modal
          title={itemForm.id ? "Edit item" : "Register new item"}
          subtitle="Item name, type and unit are stored in the database."
          onClose={() => setItemForm(null)}
        >
          <form onSubmit={saveItem} className="space-y-4">
            <div>
              <label className={labelClass}>Item name *</label>
              <input
                autoFocus
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g. A4 Copy Paper"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Item type *</label>
                <select
                  value={itemForm.typeId}
                  onChange={(e) => setItemForm({ ...itemForm, typeId: Number(e.target.value) })}
                  className={inputClass}
                >
                  {types.length === 0 && <option value={0}>No types yet</option>}
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Unit of measurement *</label>
                <select
                  value={itemForm.unitId}
                  onChange={(e) => setItemForm({ ...itemForm, unitId: Number(e.target.value) })}
                  className={inputClass}
                >
                  {units.length === 0 && <option value={0}>No units yet</option>}
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(types.length === 0 || units.length === 0) && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                Add at least one item type and one unit of measurement first.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setItemForm(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition disabled:opacity-60"
              >
                {saving && <FaSpinner className="animate-spin" />}
                {itemForm.id ? "Save changes" : "Register item"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Unit / type modal ──────────────────────────────────────────── */}
      {simpleForm && (
        <Modal
          title={
            simpleForm.id
              ? `Rename ${simpleForm.entity === "unit" ? "unit" : "item type"}`
              : `Add ${simpleForm.entity === "unit" ? "unit of measurement" : "item type"}`
          }
          subtitle="This value will be available in all dropdowns."
          onClose={() => setSimpleForm(null)}
        >
          <form onSubmit={saveSimple} className="space-y-4">
            <div>
              <label className={labelClass}>
                {simpleForm.entity === "unit" ? "Unit name *" : "Item type name *"}
              </label>
              <input
                autoFocus
                value={simpleForm.value}
                onChange={(e) => setSimpleForm({ ...simpleForm, value: e.target.value })}
                placeholder={simpleForm.entity === "unit" ? "e.g. Carton" : "e.g. ICT Equipment"}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSimpleForm(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 transition disabled:opacity-60"
              >
                {saving && <FaSpinner className="animate-spin" />}
                {simpleForm.id ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete confirmation ────────────────────────────────────────── */}
      {confirmTarget && (
        <Modal title="Confirm delete" onClose={() => setConfirmTarget(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/25 flex items-center justify-center flex-shrink-0">
                <FaTrash className="text-red-600 dark:text-red-400 text-sm" />
              </div>
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Delete <span className="font-semibold">“{confirmTarget.label}”</span>?
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Records already used by vouchers cannot be removed — the server will tell you
                  if that happens.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => void removeEntity()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm shadow-red-500/25 transition disabled:opacity-60"
              >
                {saving && <FaSpinner className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventorySetup;
