/**
 * StoreIssueVoucherInput
 *
 * Form for store-managers to create a new Store Issue Voucher (SIV).
 * - Fetches items and units from the authenticated backend.
 * - POSTs header + items to /store-issue-voucher in one atomic call.
 * - Resets only on success.
 */
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";
import { ENDPOINTS } from "../../../../services/endpoints";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

// ── Types ────────────────────────────────────────────────────────────────────
interface UnitMeasurement { id: number; unit: string; }
interface Item { id: number; name: string; unit_measurement_id?: number; }

interface SivItem {
  description_id: number;
  description_name: string;   // UI-only for the select
  unit_measurement_id: number;
  unit_name: string;          // UI-only for the select
  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
}

const blankItem = (): SivItem => ({
  description_id: 0,
  description_name: "",
  unit_measurement_id: 0,
  unit_name: "",
  requested: 0,
  issued: 0,
  out_of_stock: 0,
  unit_price: 0,
  total_price: 0,
  remark: "",
});

// ── Component ────────────────────────────────────────────────────────────────
const StoreIssueVoucherInput = () => {
  const [date, setDate] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [storeReqNo, setStoreReqNo] = useState(0);
  const [items, setItems] = useState<SivItem[]>([blankItem()]);

  const [dbItems, setDbItems] = useState<Item[]>([]);
  const [units, setUnits] = useState<UnitMeasurement[]>([]);
  const [fetchError, setFetchError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Load reference data ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [unitData, itemData] = await Promise.all([
          http.get<UnitMeasurement[]>(ENDPOINTS.unitMeasurements),
          http.get<Item[]>(ENDPOINTS.items),
        ]);
        setUnits(Array.isArray(unitData) ? unitData : []);
        setDbItems(Array.isArray(itemData) ? itemData : []);
      } catch {
        setFetchError("Could not load items/units — make sure you are signed in.");
      }
    };
    load();
  }, []);

  // ── Item row handlers ──────────────────────────────────────────────────────
  const updateRow = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setItems((prev) => {
        const next = [...prev];
        const row = { ...next[index] };

        if (name === "description_id") {
          const found = dbItems.find((i) => i.id === Number(value));
          row.description_id = Number(value);
          row.description_name = found?.name ?? "";
          // Auto-select the unit this item is registered with
          if (found?.unit_measurement_id) {
            const unit = units.find((u) => u.id === found.unit_measurement_id);
            if (unit) {
              row.unit_measurement_id = unit.id;
              row.unit_name = unit.unit;
            }
          }
        } else if (name === "unit_measurement_id") {
          const found = units.find((u) => u.id === Number(value));
          row.unit_measurement_id = Number(value);
          row.unit_name = found?.unit ?? "";
        } else if (
          ["requested", "issued", "out_of_stock", "unit_price"].includes(name)
        ) {
          (row as any)[name] = Number(value);
          row.total_price = row.issued * (name === "unit_price" ? Number(value) : row.unit_price);
        } else {
          (row as any)[name] = value;
        }

        next[index] = row;
        return next;
      });
    },
    [dbItems, units]
  );

  const addRow = () => setItems((prev) => [...prev, blankItem()]);
  const removeRow = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!date) return "Date is required.";
    if (!issuedTo.trim()) return "Issued To is required.";
    if (!storeReqNo) return "Store request number is required.";
    if (items.length === 0) return "At least one item is required.";
    for (const item of items) {
      if (!item.description_id) return "Every item must have a description selected.";
      if (!item.unit_measurement_id) return "Every item must have a unit of measurement.";
      if (item.requested <= 0) return "Requested quantity must be greater than 0.";
    }
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsSubmitting(true);
    try {
      await http.post("store-issue-voucher", {
        date: new Date(date).toISOString(),
        issued_to: issuedTo,
        store_req_no: storeReqNo,
        siv_items: items.map((item) => ({
          description_id: item.description_id,
          unit_measurement_id: item.unit_measurement_id,
          requested: item.requested,
          issued: item.issued,
          out_of_stock: item.out_of_stock,
          unit_price: item.unit_price,
          total_price: item.issued * item.unit_price,
          remark: item.remark,
        })),
      });

      // Reset form
      setDate("");
      setIssuedTo("");
      setStoreReqNo(0);
      setItems([blankItem()]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">New Store Issue Voucher</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Issue items from the store to a department</p>
      </div>

      {/* Banners */}
      {fetchError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm px-4 py-3 rounded-xl">
          ⚠ {fetchError}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl">
          ✓ Store Issue Voucher submitted successfully!
        </div>
      )}

      {/* Header fields */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Issued To *</label>
            <input type="text" value={issuedTo} onChange={(e) => setIssuedTo(e.target.value)}
              placeholder="Finance Department"
              className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Store Req. No *</label>
            <input type="number" min={0} value={storeReqNo || ""}
              onChange={(e) => setStoreReqNo(Number(e.target.value))}
              placeholder="101"
              className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Items</h3>
        <div className="space-y-5">
          {items.map((item, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Item (Description) */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Item *</label>
                  <select name="description_id" value={item.description_id || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    <option value="">Select item…</option>
                    {dbItems.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Unit *</label>
                  <select name="unit_measurement_id" value={item.unit_measurement_id || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    <option value="">Select unit…</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.unit}</option>
                    ))}
                  </select>
                </div>

                {/* Requested */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Requested *</label>
                  <input type="number" min={0} name="requested" value={item.requested || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Issued */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Issued</label>
                  <input type="number" min={0} name="issued" value={item.issued || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Out of stock */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Out of Stock</label>
                  <input type="number" min={0} name="out_of_stock" value={item.out_of_stock || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Unit price */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Unit Price</label>
                  <input type="number" min={0} step="0.01" name="unit_price" value={item.unit_price || ""}
                    onChange={(e) => updateRow(index, e)}
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Total (read-only) */}
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Total Price</label>
                  <input type="number" readOnly
                    value={(item.issued * item.unit_price).toFixed(2)}
                    className="p-2 border border-slate-100 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400" />
                </div>

                {/* Remark */}
                <div className="flex flex-col sm:col-span-2">
                  <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Remark</label>
                  <input type="text" name="remark" value={item.remark}
                    onChange={(e) => updateRow(index, e)}
                    placeholder="Optional remark…"
                    className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {items.length > 1 && (
                <div className="flex justify-end mt-3">
                  <button onClick={() => removeRow(index)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline transition">
                    Remove this item
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addRow}
          className="mt-4 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition">
          + Add Another Item
        </button>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl transition shadow-sm shadow-blue-200">
          {isSubmitting ? "Submitting…" : "Submit Voucher"}
        </button>
      </div>
    </div>
  );
};

export default StoreIssueVoucherInput;
