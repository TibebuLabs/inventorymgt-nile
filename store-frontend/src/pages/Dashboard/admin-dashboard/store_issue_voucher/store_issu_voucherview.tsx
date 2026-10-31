import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaSave,
  FaCheck,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";

interface Description {
  id: number;
  name: string;
}

interface UnitMeasurement {
  id: number;
  unit: string;
}

interface StoreIssueVoucherItem {
  id: number;
  description_id: number;
  unit_measurement_id: number;
  requested: number;
  issued: number;
  out_of_stock: number;
  unit_price: number;
  total_price: number;
  remark: string;
  store_issue_key: number;
}

interface StoreIssueVoucher {
  id: number;
  issued_to: string;
  store_req_no: number;
  total_id: number | null;
  date: string;
  StoreIssueVoucherItem: StoreIssueVoucherItem[];
  total: number | null;
}

const StoreIssueVoucherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [storeIssueVoucher, setStoreIssueVoucher] = useState<StoreIssueVoucher | null>(null);
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<StoreIssueVoucherItem>>({});
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    fetchData();
    fetchDescriptions();
    fetchUnitMeasurements();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get<StoreIssueVoucher>(
        `http://192.168.8.17:3000/store-issue-voucher/${id}`
      );
      setStoreIssueVoucher(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch store issue voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchDescriptions = async () => {
    try {
      const response = await axios.get<Description[]>(
        `http://192.168.8.17:3000/descriptions`
      );
      setDescriptions(response.data);
    } catch (err) {
      console.error("Error fetching descriptions:", err);
    }
  };

  const fetchUnitMeasurements = async () => {
    try {
      const response = await axios.get<UnitMeasurement[]>(
        `http://192.168.8.17:3000/unit-measurements`
      );
      setUnitMeasurements(response.data);
    } catch (err) {
      console.error("Error fetching unit measurements:", err);
    }
  };

  const getDescriptionName = (id: number) => {
    const description = descriptions.find(d => d.id === id);
    return description ? description.name : `Description ${id}`;
  };

  const getUnitMeasurementName = (id: number) => {
    const unit = unitMeasurements.find(u => u.id === id);
    return unit ? unit.unit : `Unit ${id}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedValues(prev => ({
      ...prev,
      [name]: name === "description_id" || name === "unit_measurement_id" 
        ? parseInt(value, 10) 
        : name === "unit_price" || name === "total_price"
        ? parseFloat(value)
        : value
    }));
  };

  const handleEdit = (index: number) => {
    if (!storeIssueVoucher?.StoreIssueVoucherItem) return;
    setEditingIndex(index);
    setEditedValues({ ...storeIssueVoucher.StoreIssueVoucherItem[index] });
    setMenuOpenIndex(null);
  };

  const handleDelete = async (index: number) => {
    if (!storeIssueVoucher?.StoreIssueVoucherItem) return;
    
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const itemId = storeIssueVoucher.StoreIssueVoucherItem[index].id;
        await axios.delete(
          `http://192.168.8.17:3000/store-issue-voucher-item/${itemId}`
        );
        
        const updatedItems = [...storeIssueVoucher.StoreIssueVoucherItem];
        updatedItems.splice(index, 1);
        setStoreIssueVoucher({
          ...storeIssueVoucher,
          StoreIssueVoucherItem: updatedItems,
        });
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Failed to delete item");
      }
    }
    setMenuOpenIndex(null);
  };

  const handleUpdate = async () => {
    if (
      editingIndex === null ||
      !storeIssueVoucher ||
      !storeIssueVoucher.StoreIssueVoucherItem
    ) return;

    try {
      const itemId = storeIssueVoucher.StoreIssueVoucherItem[editingIndex].id;
      await axios.put(
        `http://192.168.8.17:3000/store-issue-voucher-item/${itemId}`,
        editedValues
      );

      const updatedItems = [...storeIssueVoucher.StoreIssueVoucherItem];
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        ...editedValues,
      };
      setStoreIssueVoucher({
        ...storeIssueVoucher,
        StoreIssueVoucherItem: updatedItems,
      });
      setEditingIndex(null);
      setEditedValues({});
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item");
    }
  };

  const toggleMenu = (index: number) => {
    setMenuOpenIndex(menuOpenIndex === index ? null : index);
  };

  const handleApprove = () => {
    if (preparedBy.trim() === "") {
      alert("Please enter your name in the 'Prepared by' field.");
      return;
    }
    setShowApprovePopup(true);
  };

  const handleApproveSubmit = () => {
    if (email === "test@example.com" && password === "password") {
      setIsApproved(true);
      setShowApprovePopup(false);
      setEmail("");
      setPassword("");
      alert("File sent internally for Received by page.");
    } else {
      alert("Invalid email or password.");
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = `
        <style>
          @media print {
            .print-header {
              text-align: center;
              margin: 20px 0;
            }
            .print-header img {
              width: 100px;
              height: 100px;
            }
            .print-header h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .print-header h2 {
              font-size: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
            }
            .print-table th, .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f2f2f2;
            }
            .print-actions {
              display: none;
            }
            .print-signature-fields {
              box-shadow: none !important;
            }
            .group-header {
              background-color: #e0e0e0 !important;
              font-weight: bold;
              text-align: center;
            }
          }
        </style>
        <div class="print-header">
          <img src="logo-placeholder.png" alt="Logo" />
          <h1>Company Name</h1>
          <h2>Store Issue Voucher</h2>
        </div>
        ${printContents}
      `;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!storeIssueVoucher) return <div className="p-4">No data available</div>;
  if (!storeIssueVoucher.StoreIssueVoucherItem || storeIssueVoucher.StoreIssueVoucherItem.length === 0)
    return <div className="p-4">No items available</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all flex items-center"
          onClick={handlePrint}
        >
          <FaPrint className="mr-2" /> Print
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">
        Store Issue Voucher
      </h2>

      <div id="printable-area">
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start">
            <p>
              <strong>Date:</strong>{" "}
              <span className="ml-2 underline">
                {new Date(storeIssueVoucher.date).toLocaleDateString()}
              </span>
            </p>
            <p>
              <strong>Issued To:</strong>{" "}
              <span className="ml-2 underline">
                {storeIssueVoucher.issued_to}
              </span>
            </p>
            <p>
              <strong>Store Request Number:</strong>{" "}
              <span className="ml-2 underline">
                {storeIssueVoucher.store_req_no}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full table-auto border-collapse print-table">
            <thead className="bg-gray-200">
              <tr>
                <th rowSpan={2} className="border px-4 py-2 text-left">
                  S/No
                </th>
                <th rowSpan={2} className="border px-4 py-2 text-left">
                  Description
                </th>
                <th rowSpan={2} className="border px-4 py-2 text-left">
                  Unit Measurement
                </th>
                <th
                  colSpan={3}
                  className="border px-4 py-2 text-center group-header"
                >
                  Quantity
                </th>
                <th
                  colSpan={2}
                  className="border px-4 py-2 text-center group-header"
                >
                  Value
                </th>
                <th rowSpan={2} className="border px-4 py-2 text-left">
                  Remarks
                </th>
                <th
                  rowSpan={2}
                  className="border px-4 py-2 text-center print-actions"
                >
                  Actions
                </th>
              </tr>
              <tr>
                <th className="border px-4 py-2 text-center">Requested</th>
                <th className="border px-4 py-2 text-center">Issued</th>
                <th className="border px-4 py-2 text-center">Out of Stock</th>
                <th className="border px-4 py-2 text-center">Unit Price</th>
                <th className="border px-4 py-2 text-center">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {storeIssueVoucher.StoreIssueVoucherItem.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-all ${
                    editingIndex === index ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="border px-4 py-2 text-left">{index + 1}</td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="description_id"
                        value={editedValues.description_id || item.description_id}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      getDescriptionName(item.description_id))
                    }
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="unit_measurement_id"
                        value={editedValues.unit_measurement_id || item.unit_measurement_id}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      getUnitMeasurementName(item.unit_measurement_id)
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="requested"
                        value={editedValues.requested ?? item.requested}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.requested
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="issued"
                        value={editedValues.issued ?? item.issued}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.issued
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="out_of_stock"
                        value={editedValues.out_of_stock ?? item.out_of_stock}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.out_of_stock
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="unit_price"
                        value={editedValues.unit_price ?? item.unit_price}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      `$${item.unit_price.toFixed(2)}`
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="total_price"
                        value={editedValues.total_price ?? item.total_price}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      `$${item.total_price.toFixed(2)}`
                    )}
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="remark"
                        value={editedValues.remark ?? item.remark}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.remark
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center print-actions relative">
                    {editingIndex === index ? (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all flex items-center"
                        onClick={handleUpdate}
                      >
                        <FaSave className="mr-2" /> Save
                      </button>
                    ) : (
                      <>
                        <button
                          className="text-gray-600 hover:text-gray-900 focus:outline-none"
                          onClick={() => toggleMenu(index)}
                        >
                          <FaEllipsisV />
                        </button>
                        {menuOpenIndex === index && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEdit(index)}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                              onClick={() => handleDelete(index)}
                            >
                              <FaTrash className="mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mt-4 grid grid-cols-3 gap-4 print-signature-fields">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prepared by
            </label>
            {!isApproved ? (
              <>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all flex items-center justify-center w-full"
                  onClick={handleApprove}
                >
                  <FaCheck className="mr-2" /> Approve
                </button>
              </>
            ) : (
              <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                <p>
                  <strong>Name:</strong> {preparedBy}
                </p>
                <p>
                  <strong>Signature:</strong> Approved
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Checked by
            </label>
            <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <p>
                <strong>Name:</strong> __________
              </p>
              <p>
                <strong>Signature:</strong> __________
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Received by
            </label>
            <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <p>
                <strong>Name:</strong> __________
              </p>
              <p>
                <strong>Signature:</strong> __________
              </p>
            </div>
          </div>
        </div>
      </div>

      {showApprovePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Approve</h3>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
                onClick={() => setShowApprovePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleApproveSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreIssueVoucherDetail;