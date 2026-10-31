export interface StoreIssueVoucherItem {
  id: number;
  description: {
    id: number;
    name: string;
  };




  unit_measurement: {
    id: number;
    unit: string;
  };

  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
}




export interface StoreIssueVoucher {
  id: number;
  issued_to: string;
  store_req_no: number;
  total: {
    id: number;
    total_price: number;
  };

  
  date: string;
  storeIssueVoucherItems: StoreIssueVoucherItem[];
}
