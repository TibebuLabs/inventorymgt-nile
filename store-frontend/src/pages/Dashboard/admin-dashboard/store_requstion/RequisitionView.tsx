import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaSearch, FaPrint } from "react-icons/fa";
// Define the type for the form data
interface FormData {
  serialNo: string;
  workUnit: string;
  date: string;
  description: string;
  UM: string;
  qty: number;
  remarks: string;
  requestedBy: string;
  status: string;
}

const RequisitionView: React.FC = () => {
  const [requests, setRequests] = useState<FormData[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FormData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [requestsPerPage] = useState<number>(5); // Set number of requests per page
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch submitted requests from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("requisitionData") || "[]");
    setRequests(storedData);
    setFilteredRequests(storedData); // Initialize filtered requests with all data
  }, []);

  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterRequests(e.target.value, statusFilter); // Filter based on search query
  };

  // Function to handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterRequests(searchQuery, status); // Filter based on the search query and status
  };

  // Function to filter requests based on search and status
  const filterRequests = (search: string, status: string) => {
    let filtered = requests.filter((request) => {
      const matchesSearch =
        request.serialNo.toLowerCase().includes(search.toLowerCase()) ||
        request.description.toLowerCase().includes(search.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || request.status === status;
      return matchesSearch && matchesStatus;
    });

    setFilteredRequests(filtered);
  };

  // Handle approve/reject action for all requests of a specific date
  const handleAction = (date: string, action: "approve" | "reject") => {
    const updatedRequests = requests.map((request) =>
      request.date === date
        ? { ...request, status: action === "approve" ? "approved" : "rejected" }
        : request
    );

    // Update localStorage
    localStorage.setItem("requisitionData", JSON.stringify(updatedRequests));

    // Update state
    setRequests(updatedRequests);

    // Show an alert to confirm the action
    alert(`${action === "approve" ? "Approved" : "Rejected"} all requisitions for date ${date}`);
  };

  // Group requests by date
  const groupedRequests = filteredRequests.reduce((groups, request) => {
    const date = request.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(request);
    return groups;
  }, {} as { [key: string]: FormData[] });

  // Pagination: Get current requests for the page

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById("table-container");
    const printWindow = window.open("", "_blank");
    if (printContent && printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Administration Page</h1>

      {/* Search and Status Filter */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="p-2 border border-gray-300 rounded-md"
          />
          <FaSearch />
        </div>
        <div className="flex space-x-2">
          <button onClick={() => handleStatusFilter("all")} className="px-4 py-2 border rounded bg-blue-500 text-white">
            All
          </button>
          <button onClick={() => handleStatusFilter("approved")} className="px-4 py-2 border rounded bg-green-500 text-white">
            Approved
          </button>
          <button onClick={() => handleStatusFilter("pending")} className="px-4 py-2 border rounded bg-yellow-500 text-white">
            Requested
          </button>
          <button onClick={() => handleStatusFilter("rejected")} className="px-4 py-2 border rounded bg-red-500 text-white">
            Rejected
          </button>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <button onClick={handlePrint} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
          <FaPrint className="inline-block mr-2" />
          Print
        </button>
      </div>

      {/* Table to display requests */}
      <div className="overflow-x-auto" id="table-container">
        {Object.keys(groupedRequests).map((date) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Requests for {date}</h2>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Serial No</th>
                  <th className="py-2 px-4 border-b">Work Unit</th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">UM</th>
                  <th className="py-2 px-4 border-b">Qty</th>
                  <th className="py-2 px-4 border-b">Remarks</th>
                  <th className="py-2 px-4 border-b">Requested By</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedRequests[date].map((request) => (
                  <tr key={request.serialNo} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{request.serialNo}</td>
                    <td className="py-2 px-4 border-b">{request.workUnit}</td>
                    <td className="py-2 px-4 border-b">{request.date}</td>
                    <td className="py-2 px-4 border-b">{request.description}</td>
                    <td className="py-2 px-4 border-b">{request.UM}</td>
                    <td className="py-2 px-4 border-b">{request.qty}</td>
                    <td className="py-2 px-4 border-b">{request.remarks}</td>
                    <td className="py-2 px-4 border-b">{request.requestedBy}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Render "Approve All" and "Reject All" buttons for each date group */}
            <div className="flex justify-end mt-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(date, "approve")}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <FaCheckCircle className="inline-block mr-1" />
                  Approve All
                </button>
                <button
                  onClick={() => handleAction(date, "reject")}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <FaTimesCircle className="inline-block mr-1" />
                  Reject All
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * requestsPerPage >= filteredRequests.length}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};


export default RequisitionView;
