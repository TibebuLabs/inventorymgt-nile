import { useCallback, useState, useEffect } from "react";
import { cn } from "../../../lib/format";
import DynamicForm from "./components/dynamic_form";
import { GRN, GrnItem } from "./types";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";
import { useAuth } from "../../../context/AuthContext";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

const blankGRN = (): GRN => ({
  id: 0,
  date: "",
  supplier: "",
  suppliers_inv_other_no: "",
  store_location: "",
  purchase_req_num: 0,
  purchase_order_num: 0,
  approvment_id: 0,
  total_id: null,
  grn_items: [],
  approvement: { prepared_by_id: 0, checked_by_id: null, received_by_id: null },
  total: null,
});

const GoodReceivingInput = () => {
  const { user } = useAuth();
  const [generalInfo, setGeneralInfo] = useState<GRN>(blankGRN());
  const [grnItems, setGrnItems] = useState<GrnItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  // Keep grn_items in sync with child DynamicForm
  useEffect(() => {
    setGeneralInfo((prev) => ({ ...prev, grn_items: grnItems }));
  }, [grnItems]);

  const handleGRNItemsChange = useCallback((items: GrnItem[]) => {
    setGrnItems(items);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      document.documentElement.style.colorScheme = newMode ? "dark" : "light";
      return newMode;
    });
  };

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark !== darkMode) {
      toggleTheme();
    }
  }, [darkMode]);

  const validate = (): string | null => {
    if (!generalInfo.date) return "Date is required.";
    if (!generalInfo.supplier.trim()) return "Supplier name is required.";
    if (!generalInfo.suppliers_inv_other_no.trim())
      return "Invoice number is required.";
    if (!generalInfo.store_location.trim())
      return "Store location is required.";
    if (!generalInfo.purchase_req_num) return "Purchase requisition number is required.";
    if (!generalInfo.purchase_order_num) return "Purchase order number is required.";
    if (grnItems.length === 0) return "At least one item is required.";
    for (const item of grnItems) {
      if (!item.description) return "Every item must have a description/item selected.";
      if (!item.unit_measurement_id) return "Every item must have a unit of measurement.";
      if (item.qua_delivered <= 0)
        return "Quantity delivered must be greater than 0.";
      if (item.unit_price <= 0) return "Unit price must be greater than 0.";
    }
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date: new Date(generalInfo.date).toISOString(),
        supplier: generalInfo.supplier,
        suppliers_inv_other_no: generalInfo.suppliers_inv_other_no,
        store_location: generalInfo.store_location,
        purchase_req_num: generalInfo.purchase_req_num,
        purchase_order_num: generalInfo.purchase_order_num,
        prepared_by_id: user?.id ?? undefined,
        grn_items: grnItems.map((item) => ({
          description: item.description,
          unit_measurement_id: item.unit_measurement_id,
          qua_ordered: item.qua_ordered,
          qua_delivered: item.qua_delivered,
          quantity_received: item.quantity_received,
          unit_price: item.unit_price,
          remark: item.remark,
        })),
      };

      await http.post<GRN>("grn", payload);

      setGeneralInfo(blankGRN());
      setGrnItems([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      alert("GRN submitted successfully — stock will be posted after approval.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit GRN. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          New Goods Receiving Note
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀" : "🌙"}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {darkMode ? "Dark mode" : "Light mode"} · Nile Insurance Company
      </p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl">
          ✓ GRN submitted successfully
        </div>
      )}

      {/* General Information */}
      <GeneralInformationForm
        generalInfo={generalInfo}
        setGeneralInfo={setGeneralInfo}
        darkMode={darkMode}
      />

      {/* Dynamic Items */}
      <DynamicForm onGRNItemsChange={handleGRNItemsChange} />

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            text-white font-semibold rounded-xl transition shadow-sm shadow-blue-200"
        >
          {isSubmitting ? "Submitting…" : "Submit GRN"}
        </button>
      </div>
    </div>
  );
};

export default GoodReceivingInput;

// ── General Information sub-form ─────────────────────────────────────────────
const GeneralInformationForm = ({
  generalInfo,
  setGeneralInfo,
  darkMode,
}: {
  generalInfo: GRN;
  setGeneralInfo: (info: GRN) => void;
  darkMode: boolean;
}) => {
  const isDark = darkMode;
  const bgClass = isDark ? "bg-slate-800/50 dark:bg-slate-900" : "bg-white";
  const borderClass = isDark ? "dark:border-slate-700" : "border-slate-200";
  const textClass = isDark ? "text-slate-100 dark:text-slate-300" : "text-slate-600";
  const placeholderClass = isDark
    ? "placeholder-slate-500 dark:text-slate-500"
    : "placeholder-slate-400";

  const fields: {
    label: string;
    field: keyof GRN;
    type: "text" | "date" | "number";
    placeholder?: string;
  }[] = [
    { label: "Date *", field: "date", type: "date" },
    { label: "Supplier *", field: "supplier", type: "text", placeholder: "ABC Suppliers" },
    { label: "Invoice / Other No *", field: "suppliers_inv_other_no", type: "text", placeholder: "INV-001" },
    { label: "Store Location *", field: "store_location", type: "text", placeholder: "Warehouse A" },
    { label: "Purchase Req. No *", field: "purchase_req_num", type: "number", placeholder: "1001" },
    { label: "Purchase Order No *", field: "purchase_order_num", type: "number", placeholder: "2001" },
  ];

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-sm",
      bgClass,
      "border-b",
      borderClass,
      "p-6"
    )}>
      <h3 className={cn("text-base font-semibold", isDark && "text-slate-100", "mb-4")}>
        General Information
      </h3>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", isDark && "grid-cols-[1fr_1fr]")}>
        {fields.map(({ label, field, type, placeholder }) => (
          <div key={field} className="flex flex-col">
            <label className={cn("mb-1 text-xs font-medium", textClass, "uppercase tracking-wider")}>
              {label}
            </label>
            <input
              type={type}
              value={(generalInfo[field] as string | number) ?? ""}
              onChange={(e) =>
                setGeneralInfo({
                  ...generalInfo,
                  [field]: type === "number" ? Number(e.target.value) : e.target.value,
                })
              }
              placeholder={placeholder}
              className={cn(
                "p-2.5 border rounded-xl text-sm transition",
                borderClass,
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                textClass,
                placeholderClass,
                "bg-white dark:bg-slate-900"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};