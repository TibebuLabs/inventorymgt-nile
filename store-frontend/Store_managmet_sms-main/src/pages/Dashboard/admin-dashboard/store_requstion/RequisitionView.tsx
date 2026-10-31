/**
 * RequisitionView
 *
 * Department heads use this page to view all submitted SRNs and
 * approve them by creating an Approvement record via the API.
 */
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaSearch, FaPrint, FaEye } from "react-icons/fa";
import HttpNetworkService from "../../../../services/network";
import SharedPreferencesService from "../../../../services/storage";
import { useAuth } from "../../../../context/AuthContext";

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
  approvment_id: number | null;
  srn_items: SrnItem[];
  approvement: Approvement | null;
}

const getStatus = (srn: Srn) => {
  if (!srn.approvement) return "pending";
  if (srn.approvement.received_by_id || srn.approvement.checked_by_id) return "approved";
  return "pending";
};

const RequisitionView: React.FC = () => {
  const { user } = useAuth();
  const [srns, setSrns] = useState<Srn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSrn, setSelectedSrn] = useState<Srn | null>(null);
  const [approving, setApproving] = useState<number | null>(null);

  const fetchSrns = () => {
    setLoading(true);
    http
      .get<Srn[]>("srn")
      .then((data) => setSrns(Array.isArray(data) ? data : []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load SRNs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSrns(); }, []);

  const handleApprove = async (srn: Srn) => {
    if (!user?.id) return;
    setApproving(srn.id);
    try {
      if (srn.approvment_id) {
        // Update existing approvement — set checked_by to current user
        await http.patch(`approvement/${srn.approvment_id}`, {
          checked_by_id: user.id,
        });
      } else {
        // Create a new approvement
        const approvement = await http.post<{ id: number }>("approvement", {
          checked_by_id: user.id,
        });
        // Link it to the SRN
        await http.patch(`srn/${srn.id}`, {
          approvment_id: approvement.id,
        });
      }
      // Refresh
      fetchSrns();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to approve requisition.");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (_srn: Srn) => {
    if (!window.confirm("Are you sure you want to mark this SRN as rejected?")) return;
    // There is no formal "reject" state in the schema — we just leave it without approval.
    // In a real system you'd add a `rejected` boolean to the Srn model.
    alert("Rejection noted. The SRN will remain unapproved.");
  };

  const handlePrint = () => {
    const el = document.getElementById("table-container");
    if (!el) return;
    const w = window.open("", "_blank");
    if (w) { w.document.write(el.innerHTML); w.document.close(); w.print(); }
  };

  const filtered = srns
    .filter((s) => statusFilter === "all" || getStatus(s) === statusFilter)
    .filter((s) =>
      s.requisition_work_unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.srn_items?.some((i) => i.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
      Loading…
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
          <h1 className="text-xl font-bold text-slate-900">Requisition Review</h1>
          <p className="text-sm text-slate-400">{srns.length} total SRNs</p>
        </div>
        <button onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition print:hidden">
          <FaPrint /> Print
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by work unit or item…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "approved", "pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition capitalize ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="table-container">
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
                {filtered.map((srn) => {
                  const status = getStatus(srn);
                  return (
                    <tr key={srn.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5 text-slate-400">{srn.id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{srn.requisition_work_unit}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(srn.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {srn.srn_items?.length ?? 0} item{(srn.srn_items?.length ?? 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedSrn(srn)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                            <FaEye />
                          </button>
                          {status !== "approved" && (
                            <>
                              <button
                                onClick={() => handleApprove(srn)}
                                disabled={approving === srn.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700
                                  disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
                              >
                                <FaCheckCircle /> {approving === srn.id ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(srn)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100
                                  text-red-600 text-xs font-medium rounded-lg transition"
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <h2 className="font-semibold text-slate-800">SRN #{selectedSrn.id}</h2>
                <button onClick={() => setSelectedSrn(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
                  <FaTimesCircle />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <p><strong>Work Unit:</strong> {selectedSrn.requisition_work_unit}</p>
                  <p><strong>Date:</strong> {new Date(selectedSrn.date).toLocaleDateString()}</p>
                </div>
                {selectedSrn.srn_items?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Item</th>
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
              <div className="px-6 pb-5 flex justify-end gap-3">
                {getStatus(selectedSrn) !== "approved" && (
                  <button
                    onClick={() => { handleApprove(selectedSrn); setSelectedSrn(null); }}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition"
                  >
                    Approve
                  </button>
                )}
                <button onClick={() => setSelectedSrn(null)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
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

export default RequisitionView;
