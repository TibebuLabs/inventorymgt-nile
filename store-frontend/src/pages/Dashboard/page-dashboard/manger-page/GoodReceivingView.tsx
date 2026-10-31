import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaSave,
  FaCheck,
  FaPrint,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { GRN, GrnItem } from "../../Goods_receving_note/types";

const ViewReceivingGoods: React.FC = () => {
  const location = useLocation();
  const [receivingGoodsData, setReceivingGoodsData] = useState<GRN | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const getId = () => {
    const segments = location.pathname.split("/");
    return parseInt(segments[segments.length - 1], 10) || 0;
  };

  const id = getId();

  useEffect(() => {
    axios
      .get(`http://192.168.8.17:3000/grn/${id}`)
      .then((response) => {
        console.log("Data fetched:", response.data);
        setReceivingGoodsData(response.data);
        // Set initial status from API if available
        if (response.data.status) {
          setStatus(response.data.status);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<GrnItem>>({});
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedValues((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            .status-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .status-pending {
              background-color: #FFD700;
              color: #000;
            }
            .status-approved {
              background-color: #32CD32;
              color: #FFF;
            }
            .status-rejected {
              background-color: #FF4500;
              color: #FFF;
            }
          }
        </style>
        <div class="print-header">
          <img src="logo-placeholder.png" alt="Logo" />
          <h1>Nile Insurance Company</h1>
          <h2>Goods Receiving Note</h2>
        </div>

        ${printContents}
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleApprove = () => {
    // In a real app, you would send this to your API
    setStatus("approved");
    alert("GRN has been approved successfully!");
  };

  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }
    // In a real app, you would send this to your API
    setStatus("rejected");
    alert(`GRN has been rejected. Reason: ${rejectionReason}`);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return <span className="status-badge status-approved">Approved</span>;
      case "rejected":
        return <span className="status-badge status-rejected">Rejected</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error}</p>;
  if (!receivingGoodsData) return <p>No data available</p>;

  return (
    <div className="container mx-auto p-4">
      {/* Status and Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Status: {getStatusBadge()}</div>
        <div className="flex space-x-2">
          {status === "pending" && (
            <>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all flex items-center"
                onClick={handleApprove}
              >
                <FaCheck className="mr-2" /> Approve
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all flex items-center"
                onClick={() => {
                  const reason = prompt(
                    "Please enter the reason for rejection:"
                  );
                  if (reason) {
                    setRejectionReason(reason);
                    handleReject();
                  }
                }}
              >
                <FaTimes className="mr-2" /> Reject
              </button>
            </>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all flex items-center"
            onClick={handlePrint}
          >
            <FaPrint className="mr-2" /> Print
          </button>
        </div>
      </div>

      {status === "rejected" && rejectionReason && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>
            <strong>Rejection Reason:</strong> {rejectionReason}
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-center">
        Receiving Goods Overview
      </h2>

      {/* Printable Area */}
      <div id="printable-area">
        {/* Common Data Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start">
            <p>
              <strong>Date:</strong>{" "}
              <span className="ml-2 underline">{receivingGoodsData.date}</span>
            </p>
            <p>
              <strong>Supplier:</strong>{" "}
              <span className="ml-2 underline">
                {receivingGoodsData.supplier}
              </span>
            </p>
            <p>
              <strong>Supplier Invoice Number:</strong>{" "}
              <span className="ml-2 underline">
                {receivingGoodsData.suppliers_inv_other_no}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-start">
            <p>
              <strong>Store Location:</strong>{" "}
              <span className="ml-2 underline">
                {receivingGoodsData.store_location}
              </span>
            </p>
            <p>
              <strong>Purchase Request Number:</strong>{" "}
              <span className="ml-2 underline">
                {receivingGoodsData.purchase_req_num}
              </span>
            </p>
            <p>
              <strong>Purchase Order Number:</strong>{" "}
              <span className="ml-2 underline">
                {receivingGoodsData.purchase_order_num}
              </span>
            </p>
          </div>
        </div>

        {/* GRN Items Table */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="w-full table-auto border-collapse print-table">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2 text-left" rowSpan={2}>
                  Serial No
                </th>
                <th className="border px-4 py-2 text-left" rowSpan={2}>
                  Description
                </th>
                <th className="border px-4 py-2 text-left" rowSpan={2}>
                  Unit Measurement
                </th>
                <th className="border px-4 py-2 text-center" colSpan={3}>
                  Quantity
                </th>
                <th className="border px-4 py-2 text-center" colSpan={2}>
                  Price
                </th>
                <th className="border px-4 py-2 text-left" rowSpan={2}>
                  Remarks
                </th>
                {status === "pending" && (
                  <th
                    className="border px-4 py-2 text-center print-actions"
                    rowSpan={2}
                  >
                    Actions
                  </th>
                )}
              </tr>
              <tr>
                <th className="border px-4 py-2 text-center">Ordered</th>
                <th className="border px-4 py-2 text-center">Delivered</th>
                <th className="border px-4 py-2 text-center">Received</th>
                <th className="border px-4 py-2 text-center">Unit Price</th>
                <th className="border px-4 py-2 text-center">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {receivingGoodsData.grn_items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="ser_no"
                        value={editedValues.ser_no || item.ser_no}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.ser_no
                    )}
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="description"
                        value={editedValues.description || item.description}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="unit_measurement.unit"
                        value={
                          editedValues.unit_measurement?.unit ||
                          item.unit_measurement.unit
                        }
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.unit_measurement.unit
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="qua_ordered"
                        value={editedValues.qua_ordered || item.qua_ordered}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.qua_ordered
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="qua_delivered"
                        value={editedValues.qua_delivered || item.qua_delivered}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.qua_delivered
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="quantity_received"
                        value={
                          editedValues.quantity_received ||
                          item.quantity_received
                        }
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.quantity_received
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="unit_price"
                        value={editedValues.unit_price || item.unit_price}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      `$${item.unit_price}`
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        name="total_item_price"
                        value={
                          editedValues.total_item_price || item.total_item_price
                        }
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      `$${item.total_item_price}`
                    )}
                  </td>
                  <td className="border px-4 py-2 text-left">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        name="remark"
                        value={editedValues.remark || item.remark}
                        onChange={handleChange}
                        className="w-full px-2 py-1 bg-transparent focus:outline-none"
                      />
                    ) : (
                      item.remark
                    )}
                  </td>
                  {status === "pending" && (
                    <td className="border px-4 py-2 text-center print-actions relative">
                      {editingIndex === index ? (
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all flex items-center"
                          onClick={() => setEditingIndex(null)}
                        >
                          <FaSave className="mr-2" /> Save
                        </button>
                      ) : (
                        <>
                          <button
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            onClick={() =>
                              setMenuOpenIndex(
                                menuOpenIndex === index ? null : index
                              )
                            }
                          >
                            <FaEllipsisV />
                          </button>
                          {menuOpenIndex === index && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setEditingIndex(index);
                                  setEditedValues(item);
                                  setMenuOpenIndex(null);
                                }}
                              >
                                <FaEdit className="mr-2" /> Edit
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this item?"
                                    )
                                  ) {
                                    const updatedItems = [
                                      ...receivingGoodsData.grn_items,
                                    ];
                                    updatedItems.splice(index, 1);
                                    setReceivingGoodsData({
                                      ...receivingGoodsData,
                                      grn_items: updatedItems,
                                    });
                                  }
                                  setMenuOpenIndex(null);
                                }}
                              >
                                <FaTrash className="mr-2" /> Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg mt-4 grid grid-cols-3 gap-4 print-signature-fields">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prepared by
          </label>
          <div className="mt-1 block w-full px-3 py-2   ">
            <p>
              <strong>Name:</strong> Abebe
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Checked by
          </label>
          <div className="mt-1 block w-full px-3 py-2   ">
            <p>
              <strong>Name:</strong> __________
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Received by
          </label>
          <div className="mt-1 block w-full px-3 py-2   ">
            <p>
              <strong>Name:</strong> __________
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReceivingGoods;
