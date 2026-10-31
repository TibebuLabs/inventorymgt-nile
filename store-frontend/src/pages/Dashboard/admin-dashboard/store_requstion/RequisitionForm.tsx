import React, { useState } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

// Define the type for the form data
interface FormData {
  workUnit: string;
  date: string;
  description: string;
  UM: string;
  qty: number;
  remarks: string;
  requestedBy: string;
}

const RequisitionForm: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    workUnit: "",
    date: "",
    description: "",
    UM: "",
    qty: 0,
    remarks: "",
    requestedBy: "",
  });

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for submission success
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get the last serial number from localStorage and increment it for new submissions
  const getNextSerialNo = () => {
    const storedData = JSON.parse(
      localStorage.getItem("requisitionData") || "[]"
    );
    const lastSerialNo = storedData.length
      ? storedData[storedData.length - 1].serialNo
      : 0;
    return (parseInt(lastSerialNo) + 1).toString(); // Increment serial number
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const serialNo = getNextSerialNo(); // Auto-increment serial number

    const submissionData = {
      ...formData,
      serialNo, // Add the auto-incremented serial number
      status: "pending", // Default status when submitted
    };

    // Save the form data to localStorage
    const storedData = JSON.parse(
      localStorage.getItem("requisitionData") || "[]"
    );
    storedData.push(submissionData);
    localStorage.setItem("requisitionData", JSON.stringify(storedData));

    setIsSubmitted(true);
    setIsModalOpen(false); // Close modal after submission
    console.log("Form Data Submitted:", submissionData);

    // Clear form after submission (except for workUnit, date, requestedBy)
    setFormData({
      workUnit: formData.workUnit,
      date: formData.date,
      description: "",
      UM: "",
      qty: 0,
      remarks: "",
      requestedBy: formData.requestedBy,
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // Handle preview button click
  const handlePreview = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Top Bar with Logo and Title */}
      <div className="flex flex-col items-center justify-center mb-6 p-4 bg-green-500 text-white rounded-lg relative">
        <div className="absolute left-4 top-4"></div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">NILE INSURANCE COMPANY SC</h1>
          <h2 className="text-xl font-semibold mt-2">STORE REQUISITION FORM</h2>
        </div>
      </div>

      {/* Success Notification */}
      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <div className="flex items-center">
            <FaCheckCircle className="w-5 h-5 mr-2" />
            <span>Data submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First part: Work Unit and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Work Unit
            </label>
            <input
              type="text"
              name="workUnit"
              value={formData.workUnit}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Second part: Description, UM, Qty, Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              UM
            </label>
            <input
              type="text"
              name="UM"
              value={formData.UM}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Qty
            </label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Third part: Requested By */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Requested By
          </label>
          <input
            type="text"
            name="requestedBy"
            value={formData.requestedBy}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Preview
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Modal for Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <strong>Work Unit:</strong> {formData.workUnit}
              </p>
              <p>
                <strong>Date:</strong> {formData.date}
              </p>
              <p>
                <strong>Description:</strong> {formData.description}
              </p>
              <p>
                <strong>UM:</strong> {formData.UM}
              </p>
              <p>
                <strong>Qty:</strong> {formData.qty}
              </p>
              <p>
                <strong>Remarks:</strong> {formData.remarks}
              </p>
              <p>
                <strong>Requested By:</strong> {formData.requestedBy}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionForm;
