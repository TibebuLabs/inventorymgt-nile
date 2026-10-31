import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import SharedPreferencesService from "../../../../services/storage";
import HttpNetworkService from "../../../../services/network";

interface SivItem {
  store_issue_key: number;
  description_id: number;
  unit_measurement_id: number;
  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
}

interface StoreIssueVoucher {
  id: number;
  issued_to: string;
  store_req_no: number;
  date: string;
  storeIssueVoucherItems: SivItem[];
}

const StoreIssueVoucherList: React.FC = () => {
  const [storeIssueVouchers, setStoreIssueVouchers] = useState<
    StoreIssueVoucher[]
  >([]);
  const [filteredVouchers, setFilteredVouchers] = useState<StoreIssueVoucher[]>(
    []
  );
  const [searchDate, setSearchDate] = useState<string>("");
  const [searchSupplier, setSearchSupplier] = useState<string>("");
  const [searchPurchaseOrder, setSearchPurchaseOrder] = useState<string>("");
  const [showSupplierList, setShowSupplierList] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const prefs = SharedPreferencesService.getInstance();
  const httpService = new HttpNetworkService(prefs);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await httpService.get<StoreIssueVoucher[]>(
          "store-issue-voucher",
          false
        );
        if (!response) {
          throw new Error("Network response was not ok");
        }
        setStoreIssueVouchers(response);
        setFilteredVouchers(response);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchDate, searchSupplier, searchPurchaseOrder, storeIssueVouchers]);

  const handleSearch = () => {
    const filteredData = storeIssueVouchers.filter((voucher) => {
      const matchesDate = searchDate ? voucher.date.includes(searchDate) : true;
      const matchesSupplier = searchSupplier
        ? voucher.issued_to.toLowerCase().includes(searchSupplier.toLowerCase())
        : true;
      const matchesPurchaseOrder = searchPurchaseOrder
        ? voucher.store_req_no.toString().includes(searchPurchaseOrder)
        : true;
      return matchesDate && matchesSupplier && matchesPurchaseOrder;
    });
    setFilteredVouchers(filteredData);
  };

  const handleSupplierClick = (supplier: string) => {
    setSearchSupplier(supplier);
    setShowSupplierList(false);
  };

  const handleViewDetails = (voucherId: number) => {
    navigate(`/dashboard/store-issue-voucher/${voucherId}`);
  };

  const uniqueSuppliers = Array.from(
    new Set(storeIssueVouchers.map((voucher) => voucher.issued_to))
  );

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Store Issue Vouchers</h2>

      <div className="mb-4 space-y-2">
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Search by Date (YYYY-MM-DD)"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg flex-grow"
          />
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by Supplier"
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              onFocus={() => setShowSupplierList(true)}
              onBlur={() => setTimeout(() => setShowSupplierList(false), 200)}
              className="border border-gray-300 p-2 rounded-lg w-full"
            />
            {showSupplierList && uniqueSuppliers.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-60 overflow-y-auto">
                {uniqueSuppliers.map((supplier) => (
                  <div
                    key={supplier}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSupplierClick(supplier)}
                  >
                    {supplier}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Search by Store Request Number"
            value={searchPurchaseOrder}
            onChange={(e) => setSearchPurchaseOrder(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg flex-grow"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <FaSearch className="inline-block mr-2" /> Search
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Issued To</th>
              <th className="border px-4 py-2">Store Request Number</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.length > 0 ? (
              filteredVouchers.map((voucher, index) => (
                <tr key={index} className="border hover:bg-gray-100">
                  <td className="border px-4 py-2">{voucher.date}</td>
                  <td className="border px-4 py-2">{voucher.issued_to}</td>
                  <td className="border px-4 py-2">{voucher.store_req_no}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleViewDetails(voucher.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center mx-auto"
                    >
                      <FaEye className="mr-2" /> View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreIssueVoucherList;
