/**
 * StatusPage
 *
 * Employees can view their own Store Requisition Notes (SRNs) fetched from
 * the API, filter by search term, and see the status of each request.
 */
import React, { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaPrint, FaEye } from "react-icons/fa";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

interface SrnItem {
  id: number;
  serial_num: number;
  description: string;
  unit_measurement: { unit: string };
  quantity: number;
  remarks: string;
}

interface Approvement {
  id: number;
  prepared_by_id: number | null;
  checked_by_id: number | null;
  received_by_id: number | null;
}

interface Srn {
  id: number;
  requisition_work_unit: string;
  date: string;
  srn_items: SrnItem[];
  approvement: Approvement | null;
}

// Derive approval status from the approvement record
const getStatus = (srn: Srn): "approved" | "pending" | "not approved" => {
  if (!srn.approvement) return "pending";
  if (srn.approvement.received_by_id || srn.approvement.checked_by_id) return "approved";
  return "pending";
};

const StatusPage: React.FC = () => {
  const [srns, setSrns] = useState<Srn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "not approved">("all");
  const [selectedSrn, setSelectedSrn] = useState<Srn | null>(null);

  useEffect(() => {
    http
      .get<Srn[]>("srn")
      .then((data) => setSrns(Array.isArray(data) ? data : []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load requisitions"))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => window.print();

  const filtered = srns
    .filter((s) => filterStatus === "all" || getStatus(s) === filterStatus)
    .filter((s) =>
      s.requisition_work_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.srn_items?.some((item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const statusBadge = (srn: Srn) => {
    const status = getStatus(srn);
    const cls = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      "not approved": "bg-red-100 text-red-700",
    }[status];
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
        {status}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
      Loading requisitions…
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Requisitions</h1>
          <p className="text-sm text-slate-400">{srns.length} requisitions submitted</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition print:hidden"
        >
          <FaPrint /> Print
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by work unit or item description…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="not approved">Not Approved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="print-content">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FaSearch className="mx-auto text-3xl mb-2 opacity-40" />
            <p className="text-sm">No requisitions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Work Unit</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((srn) => (
                  <tr key={srn.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 text-slate-400">{srn.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{srn.requisition_work_unit}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(srn.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {srn.srn_items?.length ?? 0} item{(srn.srn_items?.length ?? 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(srn)}</td>
                    <td className="px-5 py-3.5 text-right print:hidden">
                      <button
                        onClick={() => setSelectedSrn(srn)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSrn && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedSrn(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Requisition #{selectedSrn.id}</h2>
                <button onClick={() => setSelectedSrn(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Work Unit:</strong> {selectedSrn.requisition_work_unit}</p>
                  <p><strong>Date:</strong> {new Date(selectedSrn.date).toLocaleDateString()}</p>
                  <p className="col-span-2"><strong>Status:</strong> {statusBadge(selectedSrn)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-2">Requested Items</p>
                  {selectedSrn.srn_items?.length ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Unit</th>
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-left">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedSrn.srn_items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 text-slate-400">{item.serial_num}</td>
                              <td className="px-3 py-2 text-slate-800">{item.description}</td>
                              <td className="px-3 py-2 text-slate-500">{item.unit_measurement?.unit}</td>
                              <td className="px-3 py-2 text-right font-medium">{item.quantity}</td>
                              <td className="px-3 py-2 text-slate-500">{item.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs">No items on this requisition.</p>
                  )}
                </div>
              </div>
              <div className="px-6 pb-5 flex justify-end">
                <button onClick={() => setSelectedSrn(null)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusPage;
