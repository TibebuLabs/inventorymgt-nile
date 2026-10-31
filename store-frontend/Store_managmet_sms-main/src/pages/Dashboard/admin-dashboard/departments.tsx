import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

interface Department { id: number; department_name: string; }

const prefs = SharedPreferencesService.getInstance();
const http  = new HttpNetworkService(prefs);

const Departments = () => {
  const [departments,    setDepartments]    = useState<Department[]>([]);
  const [newDepartment,  setNewDepartment]  = useState("");
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [error,          setError]          = useState("");
  const [searchQuery,    setSearchQuery]    = useState("");

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const data = await http.get<Department[]>("department");
      setDepartments(data);
    } catch { setError("Failed to fetch departments."); }
  };

  const handleAdd = async () => {
    if (!newDepartment.trim()) { setError("Name cannot be empty."); return; }
    try {
      const data = await http.post<Department>("department", { department_name: newDepartment });
      setDepartments(prev => [...prev, data]);
      setNewDepartment("");
      setError("");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to add."); }
  };

  const handleUpdate = async () => {
    if (!editDepartment?.department_name.trim()) { setError("Name cannot be empty."); return; }
    try {
      const updated = await http.patch<Department>(`department/${editDepartment.id}`, editDepartment);
      setDepartments(prev => prev.map(d => d.id === updated.id ? updated : d));
      setEditDepartment(null);
      setError("");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to update."); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await http.delete(`department/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to delete."); }
  };

  const filtered = departments.filter(d =>
    d.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Department Management</h1>
        <p className="text-sm text-slate-400">{departments.length} departments configured</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search departments…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-slate-400 shadow-sm transition"
        />
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Add New Department</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newDepartment}
            onChange={e => setNewDepartment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Department name"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
              rounded-xl transition shadow-sm shadow-blue-200 whitespace-nowrap"
          >
            Add Department
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">All Departments</h3>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            <FaSearch className="mx-auto text-2xl mb-2" />
            <p className="text-sm">No departments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left w-16">#</th>
                  <th className="px-6 py-3 text-left">Department Name</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(dept => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5 text-slate-400">{dept.id}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      {editDepartment?.id === dept.id ? (
                        <input
                          value={editDepartment.department_name}
                          onChange={e => setEditDepartment({ ...editDepartment, department_name: e.target.value })}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                        />
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg
                            flex items-center justify-center text-xs font-bold">
                            {dept.department_name.charAt(0).toUpperCase()}
                          </div>
                          {dept.department_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {editDepartment?.id === dept.id ? (
                          <>
                            <button onClick={handleUpdate}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition">
                              Save
                            </button>
                            <button onClick={() => setEditDepartment(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditDepartment(dept)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(dept.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
