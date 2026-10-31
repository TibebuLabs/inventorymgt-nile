import { useState } from "react";
import DynamicForm from "./daynamic_form";

// Define the StoreIssueVoucher interface
interface StoreIssueVoucher {
  id: number;
  issued_to: string;
  store_req_no: number;
  date: string;
  total: {
    id: number;
    total_price: number;
  };
  storeIssueVoucherItems: StoreIssueVoucherItem[];
}

interface StoreIssueVoucherItem {
  id: number;
  description: { id: number; name: string };
  unit_measurement: { id: number; unit: string };
  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
}

const GeneralInformationForm = ({
  generalInfo,
  setGeneralInfo,
  darkMode,
}: {
  generalInfo: StoreIssueVoucher;
  setGeneralInfo: (info: StoreIssueVoucher) => void;
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

        {/* Issued To */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Issued To</label>
          <input
            type="text"
            value={generalInfo.issued_to}
            onChange={(e) =>
              setGeneralInfo({ ...generalInfo, issued_to: e.target.value })
            }
            placeholder="Enter issued to..."
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

const StoreIssueVoucherInput = ({
  onAddVoucher,
  darkMode,
}: {
  onAddVoucher: (voucher: StoreIssueVoucher) => void;
  darkMode: boolean;
}) => {
  const [generalInfo, setGeneralInfo] = useState<StoreIssueVoucher>({
    id: 0,
    issued_to: "",
    store_req_no: 0,
    date: "",
    total: {
      id: 0,
      total_price: 0,
    },
    storeIssueVoucherItems: [],
  });

  const [error, setError] = useState<string>("");
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const handleAddVoucher = () => {
    if (!generalInfo.issued_to.trim()) {
      setError("Issued To field cannot be empty.");
      return;
    }

    const newEntry: StoreIssueVoucher = {
      ...generalInfo,
      id: Date.now(), // Generate unique ID
    };

    onAddVoucher(newEntry);
    setGeneralInfo({
      id: 0,
      issued_to: "",
      store_req_no: 0,
      date: "",
      total: {
        id: 0,
        total_price: 0,
      },
      storeIssueVoucherItems: [],
    });
    setError("");
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 1000);
  };

  return (
    <div
      className={`shadow rounded-lg p-6 mb-6 transition-all duration-300 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">
        Add New Store Issue Voucher
      </h3>

      <GeneralInformationForm
        generalInfo={generalInfo}
        setGeneralInfo={setGeneralInfo}
        darkMode={darkMode}
      />

      <DynamicForm />

      <div className="flex justify-end mt-4">
        <button
          onClick={handleAddVoucher}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Success!</h3>
            <p className="text-green-500">Voucher added successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreIssueVoucherInput;
