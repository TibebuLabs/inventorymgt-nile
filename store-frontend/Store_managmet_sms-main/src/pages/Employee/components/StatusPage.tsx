import React, { useState, useEffect } from "react";
import { FaTimes, FaPrint, FaEdit, FaEye, FaTrash } from "react-icons/fa"; // Added icons
import DashboardLayout from "../EmployeeDashboard/DashboardLayout";
 // adjust path as necessary

// Define a type for the requisition data
interface RequisitionItem {
  workUnit: string;
  date: string;
  serialNo: string;
  description: string;
  UM: string;
  qty: number;
  remarks: string;
  requestedBy: string;
  approvedBy: string; // Added approvedBy field
  status: "approved" | "pending" | "not approved";
}

const StatusPage: React.FC = () => {
  const [requisitionData, setRequisitionData] = useState<RequisitionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | RequisitionItem["status"]>("all");
  const [selectedItem, setSelectedItem] = useState<RequisitionItem | null>(null); // For detail view
  const [editingItem, setEditingItem] = useState<RequisitionItem | null>(null); // For edit view

  // Load requisition data from localStorage
  useEffect(() => {
    const storedData: RequisitionItem[] = JSON.parse(localStorage.getItem("requisitionData") || "[]").map((item: any) => ({
      ...item,
      status: item.status as "approved" | "pending" | "not approved"
    }));
    setRequisitionData(storedData);
  }, []);

  // Handle editing of a requisition
  const handleEdit = (item: RequisitionItem) => {
    setEditingItem(item);
  };

  // Handle saving edited requisition
  const handleSaveEdit = (updatedItem: RequisitionItem) => {
    const updatedData = requisitionData.map((item) =>
      item.serialNo === updatedItem.serialNo ? updatedItem : item
    );
    setRequisitionData(updatedData.map(item => ({
      ...item,
      status: item.status as "approved" | "pending" | "not approved"
    })));
    localStorage.setItem("requisitionData", JSON.stringify(updatedData));
    setEditingItem(null);
  };

  // Handle cancellation of a requisition
  const handleCancel = (serialNo: string) => {
    const updatedData = requisitionData.filter(
      (item) => item.serialNo !== serialNo || item.status === "approved"
    );
  
    setRequisitionData(updatedData.map(item => ({
      ...item,
      status: item.status as "approved" | "pending" | "not approved"
    })));
  
    localStorage.setItem("requisitionData", JSON.stringify(updatedData));
  };
  

  // Handle viewing details of a requisition
  const handleViewDetails = (item: RequisitionItem) => {
    setSelectedItem(item);
  };

  // Close the detail modal
  const closeModal = () => {
    setSelectedItem(null);
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Filter and search logic
  const filteredData = requisitionData
    .filter((item) => {
      if (filterStatus === "all") return true;
      return item.status === filterStatus;
    })
    .filter((item) => {
      return (
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Group data by date
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, RequisitionItem[]>);

  return (
    <DashboardLayout>
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Top Bar with Logo and Title */}
      <div className="flex flex-col items-center justify-center mb-6 p-4 bg-green-500 text-white rounded-lg relative">
        <div className="absolute left-4 top-4">
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">NILE INSURANCE COMPANY SC</h1>
          <h2 className="text-xl font-semibold mt-2">STORE REQUISITION HISTORY</h2>
        </div>
      </div>

      {/* Search, Filter, and Print Button */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="relative flex-grow print:hidden">
          <input
            type="text"
            placeholder="Search by description, serial no, or requested by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | RequisitionItem["status"])}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="not approved">Not Approved</option>
        </select>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPrint className="w-5 h-5" />
        </button>
      </div>

      {/* Grouped Data */}
<div id="print-content">
  {Object.keys(groupedData).length > 0 ? (
    Object.keys(groupedData).map((date) => (
      <div key={date} className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Requisition Work Unit:</span> {groupedData[date][0].workUnit}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Date:</span> {date}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {groupedData[date].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.UM}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.qty}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{item.remarks}</td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold ${
                      item.status === "approved"
                        ? "text-green-600"
                        : item.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.status === "approved"
                      ? "Approved"
                      : item.status === "pending"
                      ? "Pending"
                      : "Not Approved"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      disabled={item.status === "approved"}
                      className={`p-2 rounded ${
                        item.status === "approved"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleCancel(item.serialNo)}
                      disabled={item.status === "approved"}
                      className={`p-2 rounded ${
                        item.status === "approved"
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white`}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-1 bg-gray-50 rounded-lg justify-between flex items-center">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Requested By:</span> {groupedData[date][0].requestedBy}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Approved By:</span> {groupedData[date][0].approvedBy || "N/A"}
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-600">No requisition data found.</p>
  )}
</div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Requisition Details</h2>
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Work Unit:</span> {selectedItem.workUnit}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {selectedItem.date}
              </div>
              <div>
                <span className="font-semibold">Serial No:</span> {selectedItem.serialNo}
              </div>
              <div>
                <span className="font-semibold">Description:</span> {selectedItem.description}
              </div>
              <div>
                <span className="font-semibold">UM:</span> {selectedItem.UM}
              </div>
              <div>
                <span className="font-semibold">Quantity:</span> {selectedItem.qty}
              </div>
              <div>
                <span className="font-semibold">Remarks:</span> {selectedItem.remarks}
              </div>
              <div>
                <span className="font-semibold">Requested By:</span> {selectedItem.requestedBy}
              </div>
              <div>
                <span className="font-semibold">Approved By:</span> {selectedItem.approvedBy || "N/A"}
              </div>
              <div>
                <span className="font-semibold print:hidden">Status:</span>{" "}
                <span
                  className={`${
                    selectedItem.status === "approved"
                      ? "text-green-600"
                      : selectedItem.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedItem.status}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Requisition</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(editingItem);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Unit</label>
                <input
                  type="text"
                  value={editingItem.workUnit}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, workUnit: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="text"
                  value={editingItem.date}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial No</label>
                <input
                  type="text"
                  value={editingItem.serialNo}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, serialNo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UM</label>
                <input
                  type="text"
                  value={editingItem.UM}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, UM: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={editingItem.qty}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, qty: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                  type="text"
                  value={editingItem.remarks}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, remarks: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Requested By</label>
                <input
                  type="text"
                  value={editingItem.requestedBy}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, requestedBy: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved By</label>
                <input
                  type="text"
                  value={editingItem.approvedBy}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, approvedBy: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default StatusPage;