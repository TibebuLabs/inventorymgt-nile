import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SharedPreferencesService from "../../../../services/storage";
import HttpNetworkService from "../../../../services/network";


interface GoodReceivingNot {
  id: number;
  date: string;
  supplier: string;
  suppliers_inv_other_no: string; // Corrected field name
  store_location: string;
  purchase_req_num: number;
  purchase_order_num: number;
  approvment_id: number | null;
  total_id: number | null;
  // grn_items?: GRNItem[]; // Made optional
  approvement?: any | null; // Made optional
  total?: any | null; // Made optional
}

const GRNList: React.FC = () => {
  const [grnList, setGrnList] = useState<GoodReceivingNot[]>([]);
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
        const response = await httpService.get<GoodReceivingNot[]>(
          "grn",
          false
        );
        console.log(response);
        // Ensure the endpoint is correct
        if (!response) {
          throw new Error("Network response was not ok");
        }
        setGrnList(response); // Directly set the response data
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred"); // Proper error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const filteredData = grnList.filter((grn) => {
      const matchesDate = searchDate ? grn.date.includes(searchDate) : true;
      const matchesSupplier = searchSupplier
        ? grn.supplier.toLowerCase().includes(searchSupplier.toLowerCase())
        : true;
      const matchesPurchaseOrder = searchPurchaseOrder
        ? grn.purchase_order_num.toString().includes(searchPurchaseOrder)
        : true;
      return matchesDate && matchesSupplier && matchesPurchaseOrder;
    });
    setGrnList(filteredData);
  };

  const handleSupplierClick = (supplier: string) => {
    setSearchSupplier(supplier);
    setShowSupplierList(false);
    const filteredData = grnList.filter((grn) =>
      grn.supplier.toLowerCase().includes(supplier.toLowerCase())
    );
    setGrnList(filteredData);
  };

  const handleViewDetails = (grn: GoodReceivingNot) => {
    navigate(`/dashboard/grn-details/${grn.id}`, { state: { grn } });
  };

  const uniqueSuppliers = Array.from(
    new Set(grnList.map((grn) => grn.supplier))
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Good Receiving Notes</h2>

      {/* Search Bar */}
      <div className="mb-4 space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search by Date (YYYY-MM-DD)"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg"
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Supplier"
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              onFocus={() => setShowSupplierList(true)}
              className="border border-gray-300 p-2 rounded-lg"
            />
            {showSupplierList && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full">
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
            placeholder="Search by Purchase Order Number"
            value={searchPurchaseOrder}
            onChange={(e) => setSearchPurchaseOrder(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* GRN List */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Supplier</th>
            <th className="border px-4 py-2">Purchase Order Number</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {grnList.map((grn) => (
            <tr
              key={grn.id}
              className="border hover:bg-gray-100 cursor-pointer"
            >
              <td className="border px-4 py-2 hover:underline">{grn.date}</td>
              <td className="border px-4 py-2 hover:underline">
                {grn.supplier}
              </td>
              <td className="border px-4 py-2 hover:underline">
                {grn.purchase_order_num}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleViewDetails(grn)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GRNList;
