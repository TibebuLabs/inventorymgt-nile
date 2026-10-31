import React, { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { GrnItem, Item, UnitMeasurement } from "../types";

interface DynamicFormProps {
  onGRNItemsChange: (grnItems: GrnItem[]) => void; // Callback to pass data to the parent
}

const DynamicForm: React.FC<DynamicFormProps> = ({ onGRNItemsChange }) => {
  const [newGoods, setNewGoods] = useState<GrnItem[]>([
    {
      grn_id: 1,
      ser_no: 0,
      description: 0,
      unit_measurement_id: 0,
      qua_ordered: 0,
      qua_delivered: 0,
      quantity_received: 0,
      unit_price: 0,
      total_item_price: 0,
      remark: "",
      item: { id: 0, name: "", unit_measurement_id: 1, type_id: 1 },
      unit_measurement: {
        id: 0,
        unit: "",
      },
      id: 0,
    },
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Fetch unit measurements when the component mounts
  useEffect(() => {
    const fetchUnitMeasurements = async () => {
      try {
        const response = await axios.get(
          "http://192.168.8.17:3000/unit-measurement"
        );
        console.log("Unit Measurements:", response.data);

        // Ensure the response data is an array of UnitMeasurement objects
        if (Array.isArray(response.data)) {
          setUnitMeasurements(response.data);
        } else {
          console.error("Invalid unit measurements data:", response.data);
          setUnitMeasurements([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching unit measurements:", error);
        setUnitMeasurements([]); // Fallback to an empty array
      }
    };

    fetchUnitMeasurements();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch items when the component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://192.168.8.17:3000/items");
        console.log("Items:", response.data);

        // Ensure the response data is an array of Item objects
        if (Array.isArray(response.data)) {
          setItems(response.data);
        } else {
          console.error("Invalid items data:", response.data);
          setItems([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]); // Fallback to an empty array
      }
    };

    fetchItems();
  }, []);

  // Notify parent whenever `newGoods` changes
  useEffect(() => {
    onGRNItemsChange(newGoods);
  }, [newGoods]);

  const handleAddGood = () => {
    const newItem: GrnItem = {
      grn_id: 0,
      ser_no: 1,
      description: 0,
      unit_measurement_id: 0,
      qua_ordered: 0,
      qua_delivered: 0,
      quantity_received: 0,
      unit_price: 0,
      total_item_price: 0,
      remark: "",
      item: {
        id: 0,
        name: "",
        unit_measurement_id: 0,
        type_id: 0,
      },
      unit_measurement: {
        id: 0,
        unit: "",
      },
      id: 0,
    };

    setNewGoods([...newGoods, newItem]);
  };

  const handleInputChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedGoods = [...newGoods];

    if (name === "unit_measurement") {
      // Find the selected unit measurement object
      const selectedUnit = unitMeasurements.find((unit) => unit.unit === value);
      if (selectedUnit) {
        updatedGoods[index] = {
          ...updatedGoods[index],
          unit_measurement_id: selectedUnit.id,
          unit_measurement: {
            id: selectedUnit.id,
            unit: selectedUnit.unit,
          },
        };
      }
    } else if (name === "item") {
      // Find the selected item object
      const selectedItem = items.find((item) => item.name === value);
      if (selectedItem) {
        updatedGoods[index] = {
          ...updatedGoods[index],
          description: selectedItem.id,
          item: {
            id: selectedItem.id,
            name: selectedItem.name,
            unit_measurement_id: selectedItem.unit_measurement_id,
            type_id: selectedItem.type_id,
          },
        };
      }
    } else if (
      name === "qua_ordered" ||
      name === "qua_delivered" ||
      name === "quantity_received" ||
      name === "unit_price"
    ) {
      // Parse numeric fields to numbers
      updatedGoods[index] = {
        ...updatedGoods[index],
        [name]: Number(value), // Convert string to number
      };
    } else {
      updatedGoods[index] = {
        ...updatedGoods[index],
        [name]: value,
      };
    }

    setNewGoods(updatedGoods);
  };

  const handleRemoveGood = (index: number) => {
    const removedItem = newGoods[index];
    const updatedGoods = newGoods.filter((_, i) => i !== index);
    setNewGoods(updatedGoods);

    setPopupMessage(`${removedItem.description} removed successfully!`);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 1000);
  };

  return (
    <div className="shadow-lg rounded-lg p-6 mb-6 bg-white transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4">Items Information</h3>
      <div className="space-y-6 p-6">
        {newGoods.map((good, index) => (
          <div key={index}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {/* Item Selection */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Item
                </label>
                <select
                  name="item"
                  value={good.item.name || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                >
                  <option value="">Select Item...</option>
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>

              {/* Unit Measurement */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Unit Measurement
                </label>
                <select
                  name="unit_measurement"
                  value={good.unit_measurement.unit || ""}
                  onChange={(e) => handleInputChange(index, e)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                >
                  <option value="">Select unit of measurement...</option>
                  {unitMeasurements.length > 0 ? (
                    unitMeasurements.map((unit, idx) => (
                      <option key={idx} value={unit.unit}>
                        {unit.unit}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option>
                  )}
                </select>
              </div>

              {/* Quantity Ordered */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Ordered
                </label>
                <input
                  type="number"
                  name="qua_ordered"
                  value={good.qua_ordered}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Enter quantity ordered..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Quantity Delivered */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Delivered
                </label>
                <input
                  type="number"
                  name="qua_delivered"
                  value={good.qua_delivered}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Enter quantity delivered..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Quantity Receiving */}
              <div className="flex flex-col items-start">
                <label className="mb-2 text-sm font-medium w-full">
                  Quantity Receiving
                </label>
                <input
                  type="number"
                  name="quantity_received"
                  value={good.quantity_received}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Enter quantity receiving..."
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
                  value={good.unit_price}
                  onChange={(e) => handleInputChange(index, e)}
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
                  value={good.remark}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="Add remarks or notes..."
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 hover:border-indigo-500 w-full"
                />
              </div>

              {/* Remove Icon Button */}
              <div className="flex justify-end items-center mt-4">
                <button
                  type="button"
                  onClick={() => handleRemoveGood(index)}
                  className="bg-transparent p-2.5 hover:bg-gray-200 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    color="#000000"
                    fill="none"
                  >
                    <path
                      d="M19.0005 4.99988L5.0005 18.9999M5.0005 4.99988L19.0005 18.9999"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="my-4 border-t border-gray-300"></div>
          </div>
        ))}

        {/* Add another good button */}
        <div className="text-center mt-6">
          <button
            onClick={handleAddGood}
            className="px-6 py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all duration-300"
          >
            Add Another Good
          </button>
        </div>
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-md shadow-lg">
            {popupMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicForm;