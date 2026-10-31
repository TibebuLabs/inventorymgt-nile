/**
 * DynamicForm — GRN Items
 *
 * Renders a list of editable GRN item rows. Fetches items and unit
 * measurements from the authenticated API and notifies the parent on change.
 */
import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";
import { ENDPOINTS } from "../../../../services/endpoints";
import { GrnItem, Item, UnitMeasurement } from "../types";

// ── API client (singleton) ──────────────────────────────────────────────────
const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

// ── Default blank row ────────────────────────────────────────────────────────
const blankItem = (): GrnItem => ({
  id: 0,
  grn_id: 0,
  ser_no: 0,
  description: 0,
  unit_measurement_id: 0,
  qua_ordered: 0,
  qua_delivered: 0,
  quantity_received: 0,
  unit_price: 0,
  total_item_price: 0,
  remark: "",
  item: { id: 0, name: "", unit_measurement_id: 0, type_id: 0 },
  unit_measurement: { id: 0, unit: "" },
});

interface DynamicFormProps {
  /** Called whenever the items list changes so the parent can track them. */
  onGRNItemsChange: (items: GrnItem[]) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ onGRNItemsChange }) => {
  const [rows, setRows] = useState<GrnItem[]>([blankItem()]);
  const [units, setUnits] = useState<UnitMeasurement[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [fetchError, setFetchError] = useState("");

  // ── Load reference data once ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [unitData, itemData] = await Promise.all([
          http.get<UnitMeasurement[]>(ENDPOINTS.unitMeasurements),
          http.get<Item[]>(ENDPOINTS.items),
        ]);
        setUnits(Array.isArray(unitData) ? unitData : []);
        setItems(Array.isArray(itemData) ? itemData : []);
      } catch (err) {
        setFetchError(
          "Could not load items/units — make sure you are signed in."
        );
      }
    };
    load();
  }, []);

  // ── Notify parent on every change ─────────────────────────────────────────
  useEffect(() => {
    onGRNItemsChange(rows);
  }, [rows, onGRNItemsChange]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setRows((prev) => {
        const next = [...prev];
        const row = { ...next[index] };

        if (name === "item") {
          const selected = items.find((i) => i.name === value);
          if (selected) {
            row.description = selected.id;
            row.item = { ...selected };
            // Auto-select the unit this item is registered with
            const unit = units.find((u) => u.id === selected.unit_measurement_id);
            if (unit) {
              row.unit_measurement_id = unit.id;
              row.unit_measurement = { ...unit };
            }
          }
        } else if (name === "unit_measurement") {
          const selected = units.find((u) => u.unit === value);
          if (selected) {
            row.unit_measurement_id = selected.id;
            row.unit_measurement = { ...selected };
          }
        } else if (
          ["qua_ordered", "qua_delivered", "quantity_received", "unit_price"].includes(name)
        ) {
          (row as any)[name] = Number(value);
          // Auto-calculate total item price
          if (name === "qua_delivered" || name === "unit_price") {
            const qty =
              name === "qua_delivered" ? Number(value) : row.qua_delivered;
            const price =
              name === "unit_price" ? Number(value) : row.unit_price;
            row.total_item_price = qty * price;
          }
        } else {
          (row as any)[name] = value;
        }

        next[index] = row;
        return next;
      });
    },
    [items, units]
  );

  const addRow = () => setRows((prev) => [...prev, blankItem()]);

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="shadow-lg rounded-xl p-4 sm:p-6 mb-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Items Information</h3>

      {fetchError && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
          {fetchError}
        </div>
      )}

      {!fetchError && items.length === 0 && (
        <div className="mb-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 px-4 py-2 rounded-lg">
          No items are registered yet. An administrator can add them under
          <span className="font-semibold"> Inventory Setup</span>.
        </div>
      )}

      <div className="space-y-6">
        {rows.map((row, index) => (
          <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Item */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Item *</label>
                <select
                  name="item"
                  value={row.item.name || ""}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select item…</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Unit Measurement */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Unit of Measurement *</label>
                <select
                  name="unit_measurement"
                  value={row.unit_measurement.unit || ""}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="">Select unit…</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.unit}>{u.unit}</option>
                  ))}
                </select>
              </div>

              {/* Qty Ordered */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Qty Ordered</label>
                <input
                  type="number" min={0} name="qua_ordered"
                  value={row.qua_ordered}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Qty Delivered */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Qty Delivered *</label>
                <input
                  type="number" min={0} name="qua_delivered"
                  value={row.qua_delivered}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Qty Received */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Qty Received</label>
                <input
                  type="number" min={0} name="quantity_received"
                  value={row.quantity_received}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Unit Price */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Unit Price *</label>
                <input
                  type="number" min={0} step="0.01" name="unit_price"
                  value={row.unit_price}
                  onChange={(e) => handleChange(index, e)}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Total (read-only, auto-calculated) */}
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Total Price</label>
                <input
                  type="number" readOnly
                  value={(row.qua_delivered * row.unit_price).toFixed(2)}
                  className="p-2 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-500"
                />
              </div>

              {/* Remark */}
              <div className="flex flex-col sm:col-span-2 lg:col-span-2">
                <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Remark</label>
                <input
                  type="text" name="remark"
                  value={row.remark}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Optional remark…"
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Remove row */}
            {rows.length > 1 && (
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
                >
                  Remove this item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
      >
        + Add Another Item
      </button>
    </div>
  );
};

export default DynamicForm;
