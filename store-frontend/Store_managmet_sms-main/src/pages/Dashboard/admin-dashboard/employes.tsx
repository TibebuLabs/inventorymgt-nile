import { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaSave } from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

interface Employee {
  id: number;
  full_name: string;
  department_id: number;
  email: string;
  phone: string;
  role_id: number;
  role?: { id: number; role: string };
  department?: { id: number; department_name: string };
}

interface Department {
  id: number;
  department_name: string;
}

interface Role {
  id: number;
  role: string;
}

type NewEmployee = {
  full_name: string;
  department_id: number;
  email: string;
  phone: string;
  password: string;
  role_id: number;
};

const emptyEmployee: NewEmployee = {
  full_name: "",
  department_id: 0,
  email: "",
  phone: "",
  password: "",
  role_id: 0,
};

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>(emptyEmployee);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchDepartments(), fetchRoles()]).finally(
      () => setFetching(false)
    );
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await http.get<Employee[]>("employee");
      setEmployees(data);
    } catch {
      setError("Failed to load employees.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await http.get<Department[]>("department");
      setDepartments(data);
    } catch {
      /* silently fail */
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await http.get<Role[]>("role");
      setRoles(data);
    } catch {
      /* silently fail */
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const validate = (emp: NewEmployee | Employee): string | null => {
    if (!("full_name" in emp) || !(emp as any).full_name?.trim())
      return "Full name is required.";
    if (!(emp as any).role_id || (emp as any).role_id <= 0)
      return "Please select a role.";
    if (!(emp as any).department_id || (emp as any).department_id <= 0)
      return "Please select a department.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((emp as any).email))
      return "Please enter a valid email address.";
    if (!/^\d{10}$/.test((emp as any).phone))
      return "Phone must be exactly 10 digits.";
    return null;
  };

  const handleAdd = async () => {
    const err = validate(newEmployee);
    if (err) { setError(err); return; }
    if (!newEmployee.password || newEmployee.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    setError("");
    try {
      const added = await http.post<Employee>("employee", newEmployee);
      setEmployees([...employees, added]);
      setNewEmployee(emptyEmployee);
      setIsModalOpen(false);
      showSuccess("Employee added successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editEmployee) return;
    const err = validate(editEmployee);
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      const updated = await http.put<Employee>(
        `employee/${editEmployee.id}`,
        editEmployee
      );
      setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
      setEditEmployee(null);
      showSuccess("Employee updated successfully.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await http.delete(`employee/${id}`);
      setEmployees(employees.filter((e) => e.id !== id));
      showSuccess("Employee deleted.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete employee.");
    }
  };

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getDeptName = (id: number) =>
    departments.find((d) => d.id === id)?.department_name ?? "—";
  const getRoleName = (id: number) =>
    roles.find((r) => r.id === id)?.role ?? "—";

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employee Management</h1>
          <p className="text-sm text-slate-400">{employees.length} total registered employees</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-blue-200"
        >
          <FaPlus className="text-xs" /> Add Employee
        </button>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <FaTimes className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-slate-400 shadow-sm transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {fetching ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FaSearch className="mx-auto text-3xl mb-2" />
            <p className="text-sm">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">Department</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-3.5 text-slate-400">{emp.id}</td>

                    {/* Name */}
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {editEmployee?.id === emp.id ? (
                        <input
                          value={editEmployee.full_name}
                          onChange={(e) =>
                            setEditEmployee({ ...editEmployee, full_name: e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-36"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>
                          {emp.full_name}
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-slate-500">
                      {editEmployee?.id === emp.id ? (
                        <input
                          value={editEmployee.email}
                          onChange={(e) =>
                            setEditEmployee({ ...editEmployee, email: e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
                        />
                      ) : (
                        emp.email
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                      {editEmployee?.id === emp.id ? (
                        <input
                          value={editEmployee.phone}
                          onChange={(e) =>
                            setEditEmployee({ ...editEmployee, phone: e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
                        />
                      ) : (
                        emp.phone
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 text-slate-500 hidden lg:table-cell">
                      {editEmployee?.id === emp.id ? (
                        <select
                          value={editEmployee.department_id}
                          onChange={(e) =>
                            setEditEmployee({ ...editEmployee, department_id: +e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value={0}>Select</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.department_name}</option>
                          ))}
                        </select>
                      ) : (
                        getDeptName(emp.department_id)
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {editEmployee?.id === emp.id ? (
                        <select
                          value={editEmployee.role_id}
                          onChange={(e) =>
                            setEditEmployee({ ...editEmployee, role_id: +e.target.value })
                          }
                          className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value={0}>Select</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.role}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {emp.role?.role ?? getRoleName(emp.role_id)}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      {editEmployee?.id === emp.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-lg transition"
                          >
                            <FaSave /> Save
                          </button>
                          <button
                            onClick={() => { setEditEmployee(null); setError(""); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg transition"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditEmployee(emp); setError(""); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {currentPage} of {totalPages} — {filtered.length} results
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition"
              >
                ← Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Add New Employee</h2>
                <button
                  onClick={() => { setIsModalOpen(false); setError(""); }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newEmployee.full_name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone (10 digits)</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="0911000000"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                    <select
                      value={newEmployee.department_id}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department_id: +e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value={0}>Select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                    <select
                      value={newEmployee.role_id}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role_id: +e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value={0}>Select role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5 flex justify-end gap-3">
                <button
                  onClick={() => { setIsModalOpen(false); setError(""); }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition shadow-sm"
                >
                  {loading ? "Adding…" : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Employees;
