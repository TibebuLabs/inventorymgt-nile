export interface UnitMeasurement {
  id: number;
  unit: string;
}

export interface Item {
  id: number;
  name: string;
  unit_measurement_id: number;
  type_id: number;
}

export interface GrnItem {
  id: number;
  grn_id: number;
  ser_no: number;
  description: number;
  unit_measurement_id: number;
  qua_ordered: number;
  qua_delivered: number;
  quantity_received: number;
  unit_price: number;
  total_item_price: number;
  remark: string;
  item: Item;
  unit_measurement: UnitMeasurement;
} 

export  interface Approvement {
  // id: number;
  prepared_by_id: number;
  checked_by_id: number | null;
  received_by_id: number | null;
}

export  interface  GRN {
  id: number;
  date: string;
  supplier: string;
  suppliers_inv_other_no: string;
  store_location: string;
  purchase_req_num: number;
  purchase_order_num: number;
  approvment_id: number;
  total_id: number | null;
  grn_items: GrnItem[];
  approvement: Approvement;
  total: number | null;
}
