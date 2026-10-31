import React, { useState, ChangeEvent, useEffect } from "react";
import axios from "axios"; // Ensure you have axios installed

// Define the interfaces based on the new JSON structure
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

const DynamicForm: React.FC = () => {
  const [storeIssueVoucher, setStoreIssueVoucher] = useState<StoreIssueVoucher>(
    {
      id: 0,
      issued_to: "",
      store_req_no: 0,
      total: {
        id: 0,
        total_price: 0,
      },
      date: new Date().toISOString().split("T")[0], // Default to today's date
      storeIssueVoucherItems: [
        {
          id: 0,
          description: {
            id: 0,
            name: "",
          },
          unit_measurement: {
            id: 0,
            unit: "",
          },
          requested: 0,
          issued: 0,
          out_of_stock: 0,
          unit_price: 0,
          total_price: 0,
          remark: "",
        },
      ],
    }
  );

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [unitMeasurements, setUnitMeasurements] = useState<
    { id: number; unit: string }[]
  >([]);

  // Fetch unit measurements from the database when the component mounts
  useEffect(() => {
    const fetchUnitMeasurements = async () => {
      try {
        // Replace this URL with your actual API endpoint
        const response = await axios.get(
          "http://192.168.8.17:3000/unit-measurement"
        );
        setUnitMeasurements(response.data); // Assuming response.data is an array of unit measurements
      } catch (error) {
        console.error("Error fetching unit measurements:", error);
      }
    };

    fetchUnitMeasurements();
  }, []);

  // Handle adding a new item
  const handleAddItem = () => {
    const newItem: StoreIssueVoucherItem = {
      id: storeIssueVoucher.storeIssueVoucherItems.length,
      description: {
        id: 0,
        name: "",
      },
      unit_measurement: {
        id: 0,
        unit: "",
      },
      requested: 0,
      issued: 0,
      out_of_stock: 0,
      unit_price: 0,
      total_price: 0,
      remark: "",
    };

    setStoreIssueVoucher({
      ...storeIssueVoucher,
      storeIssueVoucherItems: [
        ...storeIssueVoucher.storeIssueVoucherItems,
        newItem,
      ],
    });
  };

  // Handle input changes for the main form
  const handleMainFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreIssueVoucher({
      ...storeIssueVoucher,
      [name]: value,
    });
  };

  // Handle input changes for individual items
  const handleItemChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...storeIssueVoucher.storeIssueVoucherItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]:
        name.includes("id") ||
        name.includes("requested") ||
        name.includes("issued") ||
        name.includes("out_of_stock") ||
        name.includes("unit_price") ||
        name.includes("total_price")
          ? Number(value)
          : name === "description" || name === "unit_measurement"
          ? { ...updatedItems[index][name], id: Number(value) }
          : value,
    };

    setStoreIssueVoucher({
      ...storeIssueVoucher,
      storeIssueVoucherItems: updatedItems,
    });
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    const removedItem = storeIssueVoucher.storeIssueVoucherItems[index];
    const updatedItems = storeIssueVoucher.storeIssueVoucherItems.filter(
      (_, i) => i !== index
    );
    setStoreIssueVoucher({
      ...storeIssueVoucher,
      storeIssueVoucherItems: updatedItems,
    });

    setPopupMessage(`${removedItem.description.name} removed successfully!`);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 1000);
  };

  return (
    <div className="shadow rounded-lg p-6 mb-6 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4">Store Issue Voucher</h3>
      <div className="space-y-6 p-6">
        {/* Main Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
          <div className="flex flex-col items-start">
            <label className="mb-2 text-sm font-medium w-full">Issued To</label>
            <input
              type="text"
              name="issued_to"
              value={storeIssueVoucher.issued_to}
              onChange={handleMainFormChange}
              placeholder="Enter issued to..."
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
            />
          </div>
          <div className="flex flex-col items-start">
            <label className="mb-2 text-sm font-medium w-full">
              Store Request No
            </label>
            <input
              type="number"
              name="store_req_no"
              value={storeIssueVoucher.store_req_no}
              onChange={handleMainFormChange}
              placeholder="Enter store request number..."
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
            />
          </div>
        </div>

        {/* Items Information */}
        <h3 className="text-lg font-semibold mb-4">Items Information</h3>
        {storeIssueVoucher.storeIssueVoucherItems.map((item, index) => (
          <div key={index}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {/* Description */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={item.description.name}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Enter item description..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Unit Measurement */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Unit Measurement
                </label>
                <select
                  name="unit_measurement"
                  value={item.unit_measurement.unit}
                  onChange={(e) => handleItemChange(index, e)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                >
                  <option value="">Select unit of measurement...</option>
                  {unitMeasurements.map((unit) => (
                    <option key={unit.id} value={unit.unit}>
                      {unit.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Requested */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Requested
                </label>
                <input
                  type="number"
                  name="requested"
                  value={item.requested}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Enter quantity requested..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Quantity Issued */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Issued
                </label>
                <input
                  type="number"
                  name="issued"
                  value={item.issued}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Enter quantity issued..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Quantity Out of Stock */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Out of Stock
                </label>
                <input
                  type="number"
                  name="out_of_stock"
                  value={item.out_of_stock}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Enter quantity out of stock..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Unit Price */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Enter unit price..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Remark */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Remark
                </label>
                <input
                  type="text"
                  name="remark"
                  value={item.remark}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Add remarks..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>
            </div>

            {/* Remove Item Button */}
            <button
              onClick={() => handleRemoveItem(index)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Another Item Button */}
        <button
          onClick={handleAddItem}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Add Another Item
        </button>
      </div>
    </div>
  );
};

export default DynamicForm;
