/**
 * Canonical backend endpoint paths.
 *
 * The NestJS API exposes these resources under hyphenated paths. The legacy
 * spellings (`/item`, `/unitmesurment`) are kept as aliases on the server, but
 * every frontend call should go through this file so the contract stays in one
 * place.
 */
export const ENDPOINTS = {
  items: "items",
  itemTypes: "item-type",
  unitMeasurements: "unit-measurement",
  locations: "locations",
  grn: "grn",
  grnItems: "grn-item",
  srn: "srn",
  srnItems: "srn-item",
  siv: "store-issue-voucher",
  sivItems: "store-issue-voucher-item",
  stockBalance: "stock-balance",
  stockIn: "stock-in",
  stockOut: "stock-out",
  stock: "stock",
  scc: "scc",
  vendors: "vendors",
  auditLogs: "audit-logs",
  dashboard: "dashboard",
  notifications: "notifications",
  employees: "employee",
  departments: "department",
  roles: "role",
} as const;

/* ── Inventory master data ───────────────────────────────────────────────── */

export interface InventoryItem {
  id: number;
  name: string;
  sku?: string | null;
  reorder_level?: number;
  type_id: number;
  unit_measurement_id: number;
  location_id?: number | null;
  type?: { id: number; type: string };
  unit_measurement?: { id: number; unit: string };
  location?: InventoryLocation | null;
}

export interface InventoryItemType {
  id: number;
  type: string;
}

export interface InventoryUnit {
  id: number;
  unit: string;
}

/* ── Locations ───────────────────────────────────────────────────────────── */

export interface InventoryLocation {
  id: number;
  name: string;
  aisle?: string | null;
  shelf?: string | null;
  bin?: string | null;
  category?: string | null;
  description?: string | null;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { items: number };
}

export interface LocationPayload {
  name: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export interface LocationDisplay {
  id: number;
  label: string;
  fullPath: string; // e.g. "A-1-01"
  category?: string | null;
}

/* ── Stock ───────────────────────────────────────────────────────────────── */

export type StockStatus = "ok" | "low" | "out";

export interface StockRow {
  sccId: number;
  itemId: number | null;
  item: string;
  type: string;
  unit: string;
  location: string;
  locationName: string | null;
  aisle: string | null;
  shelf: string | null;
  bin: string | null;
  category: string | null;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderLevel: number;
  status: StockStatus;
  updatedAt: string | null;
}

export interface StockMovement {
  id: string;
  direction: "IN" | "OUT";
  item: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reference: string;
  supplier: string | null;
  createdAt: string;
  createdBy: number | null;
}

export interface StockSummary {
  totalItems: number;
  totalUnits: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

/* ── Vendors ─────────────────────────────────────────────────────────────── */

export interface Vendor {
  id: number;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  tax_id?: string | null;
  notes?: string | null;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { grns: number };
}

export interface VendorPayload {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  notes?: string;
  is_active?: boolean;
}

/* ── Documents ───────────────────────────────────────────────────────────── */

export type WorkflowStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled"
  | "issued"
  | "cancelled"
  | string;

export interface EmployeeRef {
  id: number;
  full_name: string;
  email: string;
  department?: { department_name: string } | null;
}

export interface GrnItem {
  id: number;
  ser_no: number;
  description: number;
  unit_measurement_id: number;
  qua_ordered: number;
  qua_delivered: number;
  quantity_received: number;
  unit_price: number;
  total_item_price: number;
  remark: string;
  item?: { id: number; name: string } | null;
  unit_measurement?: { id: number; unit: string } | null;
}

export interface Grn {
  id: number;
  date: string;
  supplier: string;
  suppliers_inv_other_no: string;
  store_location: string;
  purchase_req_num: number;
  purchase_order_num: number;
  status: WorkflowStatus;
  rejection_reason?: string | null;
  created_by_id?: number | null;
  approved_by_id?: number | null;
  approved_at?: string | null;
  posted_at?: string | null;
  createdAt?: string;
  total?: { id: number; total_price: number } | null;
  vendor?: { id: number; name: string } | null;
  grn_items?: GrnItem[];
  created_by?: EmployeeRef | null;
  approved_by?: EmployeeRef | null;
  approvement?: {
    id: number;
    prepared_by_id?: number | null;
    checked_by_id?: number | null;
  } | null;
}

export interface SrnItem {
  id: number;
  srn_id: number;
  serial_num: number;
  description: string;
  unit_measurement_id: number;
  quantity: number;
  remarks: string;
  item?: { id: number; name: string } | null;
  unit_measurement?: { id: number; unit: string } | null;
}

export interface Srn {
  id: number;
  requisition_work_unit: string;
  date: string;
  status: WorkflowStatus;
  rejection_reason?: string | null;
  requested_by_id?: number | null;
  approved_by_id?: number | null;
  approved_at?: string | null;
  fulfilled_at?: string | null;
  createdAt?: string;
  total?: { id: number; total_price: number } | null;
  srn_items?: SrnItem[];
  requested_by?: EmployeeRef | null;
  approved_by?: EmployeeRef | null;
  _count?: { srn_items: number };
}

export interface SivItem {
  id: number;
  description_id: number;
  unit_measurement_id: number;
  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
  description?: { id: number; name: string } | null;
  unit_measurement?: { id: number; unit: string } | null;
}

export interface Siv {
  id: number;
  issued_to: string;
  store_req_no: number;
  date: string;
  srn_id?: number | null;
  issued_by_id?: number | null;
  status: WorkflowStatus;
  createdAt?: string;
  total?: { id: number; total_price: number } | null;
  StoreIssueVoucherItem?: SivItem[];
  _count?: { StoreIssueVoucherItem: number };
}

/* ── Audit ───────────────────────────────────────────────────────────────── */

export interface AuditEntry {
  id: number;
  employee_id: number | null;
  employee_name: string | null;
  role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  method: string | null;
  path: string | null;
  ip: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface AuditStats {
  total: number;
  last7Days: number;
  byAction: { action: string; count: number }[];
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */

export interface DashboardSummary {
  counts: {
    employees: number;
    departments: number;
    items: number;
    vendors: number;
    grns: number;
    srns: number;
    sivs: number;
  };
  workflow: {
    pendingGrns: number;
    pendingSrns: number;
    approvedSrns: number;
    fulfilledSrns: number;
  };
  stock: StockSummary;
  finance: {
    receivedValue30d: number;
    issuedValue30d: number;
    receivedUnits30d: number;
    issuedUnits30d: number;
  };
  lowStock: StockRow[];
  recent: {
    grns: Grn[];
    srns: Srn[];
    sivs: Siv[];
    activity: AuditEntry[];
  };
  trend: { date: string; in: number; out: number }[];
}
