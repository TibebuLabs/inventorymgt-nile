
import { useCallback, useState, useEffect } from "react";
import DynamicForm from "./components/dynamic_form";
import { GRN, GrnItem } from "./types";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

const GoodReceivingInput = ({
  onAddGood,
  darkMode,
}: {
  onAddGood: (good: GRN) => void;
  darkMode: boolean;
}) => {
  const [generalInfo, setGeneralInfo] = useState<GRN>({
    id: 0,
    date: "",
    supplier: "",
    suppliers_inv_other_no: "",
    store_location: "",
    purchase_req_num: 0,
    purchase_order_num: 0,
    approvment_id: 1,
    total_id: null,
    grn_items: [],
    approvement: {
      prepared_by_id: 1,
      checked_by_id: null,
      received_by_id: null,
    },
    total: null,
  });

  const [grnItems, setGrnItems] = useState<GrnItem[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup

  const prefs = SharedPreferencesService.getInstance();
  const httpService = new HttpNetworkService(prefs);

  useEffect(() => {
    setGeneralInfo((prevGeneralInfo) => ({
      ...prevGeneralInfo,
      grn_items: grnItems,
    }));
  }, [grnItems]);

  const handleGRNItemsChange = useCallback((items: GrnItem[]) => {
    setGrnItems(items);
  }, []);

  const handleAddGood = () => {
    if (!generalInfo.supplier.trim()) {
    
      return;
    }

    // Ensure grn_items is updated before submitting
    const updatedGeneralInfo = {
      ...generalInfo,
      grn_items: grnItems,
    };

    onAddGood(updatedGeneralInfo);

    setGeneralInfo({
      id: 0,
      date: "",
      supplier: "",
      suppliers_inv_other_no: "",
      store_location: "",
      purchase_req_num: 0,
      purchase_order_num: 0,
      approvment_id: 1,
      total_id: null,
      grn_items: [],
      approvement: {
        prepared_by_id: 1,
        checked_by_id: null,
        received_by_id: null,
      },
      total: null,
    });

    setGrnItems([]);

  
  };

  const postData = async (data: GRN) => {
    try {
      const formattedDate = new Date(data.date).toISOString();

      const response = await httpService.post<GRN>("grn", {
        date: formattedDate,
        supplier: data.supplier,
        suppliers_inv_other_no: data.suppliers_inv_other_no,
        store_location: data.store_location,
        purchase_req_num: data.purchase_req_num,
        purchase_order_num: data.purchase_order_num,
        prepared_by_id: 1,
        total_id: 1,
        grn_items: data.grn_items,
      });

      console.log(response);

      // Show success popup
      setShowSuccessPopup(true);

      // Hide the popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`shadow rounded-lg p-6 mb-6 transition-all duration-300 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Add New Good Receiving Note</h3>

      {/* General Information Form */}
      <GeneralInformationForm
        generalInfo={generalInfo}
        setGeneralInfo={setGeneralInfo}
        darkMode={darkMode}
      />

      {/* Dynamic Form for GRN Items */}
      <DynamicForm onGRNItemsChange={handleGRNItemsChange} />

      {/* Add Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => {
            postData(generalInfo);
            handleAddGood();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
        >
          Add
        </button>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-8 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-lg">
            GRN added successfully!
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodReceivingInput;


const GeneralInformationForm = ({
  generalInfo,
  setGeneralInfo,
  darkMode,
}: {
  generalInfo: GRN;
  setGeneralInfo: (info: GRN) => void;
  darkMode: boolean;
}) => {
  return (
    <div
      className={`shadow rounded-lg p-6 mb-6 transition-all duration-300 ${
        darkMode ? "bg-gray-700" : "bg-gray-50"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">General Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Date</label>
          <input
            type="date"
            value={generalInfo.date}
            onChange={(e) =>
              setGeneralInfo({ ...generalInfo, date: e.target.value })
            }
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>

        {/* Supplier */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Supplier</label>
          <input
            type="text"
            value={generalInfo.supplier}
            onChange={(e) =>
              setGeneralInfo({ ...generalInfo, supplier: e.target.value })
            }
            placeholder="Enter supplier..."
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>

        {/* Supplier Invoice/Other No */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Supplier Invoice/Other No
          </label>
          <input
            type="text"
            value={generalInfo.suppliers_inv_other_no}
            onChange={(e) =>
              setGeneralInfo({
                ...generalInfo,
                suppliers_inv_other_no: e.target.value,
              })
            }
            placeholder="Enter supplier invoice/other no..."
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>

        {/* Store Location */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Store Location</label>
          <input
            type="text"
            value={generalInfo.store_location}
            onChange={(e) =>
              setGeneralInfo({ ...generalInfo, store_location: e.target.value })
            }
            placeholder="Enter store location..."
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>

Kassahun Wache, [01/04/2025 10:37 ጥዋት]
{/* Purchase Req. No */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Purchase Req. No</label>
          <input
            type="number"
            value={generalInfo.purchase_req_num}
            onChange={(e) =>
              setGeneralInfo({
                ...generalInfo,
                purchase_req_num: Number(e.target.value),
              })
            }
            placeholder="Enter purchase req. no..."
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>

        {/* Purchase Order No */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Purchase Order No</label>
          <input
            type="number"
            value={generalInfo.purchase_order_num}
            onChange={(e) =>
              setGeneralInfo({
                ...generalInfo,
                purchase_order_num: Number(e.target.value),
              })
            }
            placeholder="Enter purchase order no..."
            className={`p-2 border ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
          />
        </div>
      </div>
    </div>
  );
};