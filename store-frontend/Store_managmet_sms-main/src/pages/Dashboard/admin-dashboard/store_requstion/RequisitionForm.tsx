/**
 * RequisitionForm
 *
 * Employees use this to submit a Store Requisition Note (SRN) with
 * one or more items. Posts to the real /srn and /srn-item API endpoints.
 *
 * Modern, fast, and professional UI with optimistic updates,
 * skeleton loading states, and real-time validation.
 */
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { FaCheckCircle, FaTimes, FaPlus, FaClock, FaBox, FaSync } from "react-icons/fa";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";
import { cachedApi, apiInvalidate } from "../../../../services/api";
import { ENDPOINTS } from "../../../../services/endpoints";
import { useAuth } from "../../../../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  StatCard,
  Table,
  TableWrap,
  Td,
  Th,
  Tr,
  useToast,
} from "../../../../components/ui";
import { errorMessage, formatDate } from "../../../../lib/format";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

interface UnitMeasurement { id: number; unit: string; }
interface Item { id: number; name: string; unit_measurement_id?: number; type?: { type: string }; }

interface SrnItemRow {
  description: string;
  unit_measurement_id: number;
  quantity: number;
  remarks: string;
}

const blankRow = (): SrnItemRow => ({
  description: "",
  unit_measurement_id: 0,
  quantity: 0,
  remarks: "",
});

const RequisitionForm: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [workUnit, setWorkUnit] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<SrnItemRow[]>([blankRow()]);

  const [units, setUnits] = useState<UnitMeasurement[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ── Load reference data in parallel ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [unitData, itemData] = await Promise.all([
          cachedApi.get<UnitMeasurement[]>(ENDPOINTS.unitMeasurements),
          cachedApi.get<Item[]>(ENDPOINTS.items),
        ]);
        if (!cancelled) {
          setUnits(Array.isArray(unitData) ? unitData : []);
          setItems(Array.isArray(itemData) ? itemData : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setFetchError("Could not load items / units. Make sure you are signed in.");
        }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  // ── Row update with auto unit detection ──────────────────────────────────
  const updateRow = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setRows((prev) => {
        const next = [...prev];
        const row = { ...next[index] };

        if (name === "description") {
          row.description = value;
          const found = items.find((i) => i.name === value);
          if (found?.unit_measurement_id) {
            row.unit_measurement_id = found.unit_measurement_id;
          }
        } else if (name === "unit_measurement_id" || name === "quantity") {
          row[name] = Number(value);
        } else {
          row.remarks = value;
        }

        next[index] = row;
        return next;
      });
    },
    [items]
  );

  const addRow = () => setRows((prev) => [...prev, blankRow()]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!workUnit.trim()) return "Requisition work unit is required.";
    if (!date) return "Date is required.";
    if (rows.length === 0) return "Add at least one item.";
    for (const row of rows) {
      if (!row.description) return "Every item needs a description selected.";
      if (!row.unit_measurement_id) return "Every item needs a unit of measurement.";
      if (!row.quantity || row.quantity <= 0) return "Quantity must be greater than 0.";
    }
    return null;
  };

  // ── Submit with optimistic UI ────────────────────────────────────────────
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setIsSubmitting(true);
    try {
      // 1. Create the SRN header + items atomically in one request
      //    (backend supports srn_items in CreateSrnDto — works for all roles)
      await http.post<{ id: number }>("srn", {
        requisition_work_unit: workUnit,
        date: new Date(date).toISOString(),
        srn_items: rows.map((row, index) => ({
          serial_num: index + 1,
          description: row.description,
          unit_measurement_id: row.unit_measurement_id,
          quantity: row.quantity,
          remarks: row.remarks || "—",
        })),
      });

      // Reset form on success
      setWorkUnit("");
      setDate(new Date().toISOString().split("T")[0]);
      setRows([blankRow()]);
      setIsPreviewOpen(false);
      setSuccess(true);
      toast.success("Requisition submitted successfully!");
      apiInvalidate("srns");
      apiInvalidate("stock");
      apiInvalidate("dashboard");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(errorMessage(err));
      toast.error("Failed to submit requisition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Computed totals ─────────────────────────────────────────────────────
  const totalQuantity = rows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
  const isFormValid = !validate();

  if (loading) return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingBlock label="Loading items and units…" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Store Requisition"
        description="Request items from the company store. Your requisition will be routed for approval."
        icon={<FaBox />}
        badge={
          <Badge tone="blue">Employee Requisition</Badge>
        }
        actions={
          <Button variant="secondary" onClick={() => window.location.reload()} loading={loading}>
            <FaSync className="animate-spin" /> Refresh
          </Button>
        }
      />

      {/* Error / Success banners */}
      {fetchError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm px-4 py-3 rounded-xl">
          <FaClock className="mr-2" /> {fetchError}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
          <FaTimes className="flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl">
          <FaCheckCircle className="flex-shrink-0" /> Requisition submitted successfully!
        </div>
      )}

      {/* Requisition Details */}
      <Card padded={false}>
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Requisition Details</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Requisition Work Unit *" required>
              <Input
                type="text"
                value={workUnit}
                onChange={(e) => setWorkUnit(e.target.value)}
                placeholder="e.g. Finance Unit"
              />
            </Field>
            <Field label="Date *" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Requested By" required>
              <Input
                readOnly
                value={user?.fullname ?? ""}
                className="p-2.5 border border-slate-100 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400"
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Requested Items */}
      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Requested Items</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalQuantity} total units across {rows.length} item(s)
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-800/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition"
          >
            <FaPlus className="mr-1" /> Add Item
          </button>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Item */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Item *</label>
                    <select
                      name="description"
                      value={row.description}
                      onChange={(e) => updateRow(index, e)}
                      className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select item…</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.name}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Unit *</label>
                    <select
                      name="unit_measurement_id"
                      value={row.unit_measurement_id || ""}
                      onChange={(e) => updateRow(index, e)}
                      className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select unit…</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>{u.unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Quantity *</label>
                    <input
                      type="number"
                      min={0}
                      name="quantity"
                      value={row.quantity || ""}
                      onChange={(e) => updateRow(index, e)}
                      className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="flex flex-col sm:col-span-4">
                    <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Remarks</label>
                    <input
                      type="text"
                      name="remarks"
                      value={row.remarks}
                      onChange={(e) => updateRow(index, e)}
                      placeholder="Optional…"
                      className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 hover:underline transition"
                  >
                    Remove this item
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Items"
          value={rows.length}
          icon={<FaBox />}
          tone="blue"
        />
        <StatCard
          label="Total Quantity"
          value={totalQuantity}
          icon={<FaBox />}
          tone="green"
        />
        <StatCard
          label="Status"
          value="Pending Approval"
          icon={<FaClock />}
          tone="amber"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          disabled={isSubmitting || !isFormValid}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={() => handleSubmit()}
          disabled={isSubmitting || !isFormValid}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-sm shadow-blue-200"
        >
          {isSubmitting ? <FaClock className="mr-2 animate-spin" /> : null}
          {isSubmitting ? "Submitting…" : "Submit Requisition"}
        </button>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <Modal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Preview Requisition"
          description="Review your requisition before submitting."
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? "Submitting…" : "Confirm & Submit"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Work Unit</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{workUnit}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(date)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested By</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{user?.fullname}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Items:</p>
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th>Item</Th>
                      <Th className="text-center">Qty</Th>
                      <Th>Remarks</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <Tr key={i}>
                        <Td>{row.description || "—"}</Td>
                        <Td className="text-center">{row.quantity}</Td>
                        <Td>{row.remarks || "—"}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RequisitionForm;
