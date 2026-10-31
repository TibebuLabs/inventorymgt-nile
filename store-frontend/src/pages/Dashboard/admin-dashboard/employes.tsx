import { useState, useEffect, useRef } from "react";
import { FaEllipsisV, FaTimes, FaSearch } from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

interface Employee {
  id: number;
  full_name: string;
  department_id: number;
  email: string;
  phone: string;
  role_id: number;
}

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

type NewEmployee = Omit<Employee, "id"> & {
  password: string;
};

const prefs = SharedPreferencesService.getInstance();
const httpService = new HttpNetworkService(prefs);

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<NewEmployee, "id">>({
    full_name: "",
    department_id: 0,
    email: "",
    phone: "",
    password: "",
    role_id: 0,
  });
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isChecked, setisChecked] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employ = await httpService.get<Employee[]>("employee");
      const sanitizedEmployees = employ.map((emp) => ({
        id: emp.id || 0,
        full_name: emp.full_name || "",
        department_id: emp.department_id || 0,
        email: emp.email || "",
        phone: emp.phone || "",
        role_id: emp.role_id || 0,
      }));
      setEmployees(sanitizedEmployees);
    } catch (error) {
      setError("Failed to fetch employees.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await httpService.get<Department[]>("department");
      setDepartments(depts);
    } catch (error) {
      setError("Failed to fetch departments.");
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await httpService.get<Role[]>("role");
      setRoles(rolesData);
    } catch (error) {
      setError("Failed to fetch roles.");
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.full_name.trim()) {
      setError("Employee name cannot be empty.");
      return;
    }

    if (!newEmployee.role_id || newEmployee.role_id <= 0) {
      setError("Role cannot be empty or zero.");
      return;
    }

    if (!newEmployee.department_id || newEmployee.department_id <= 0) {
      setError("Department cannot be empty or zero.");
      return;
    }

    if (
      !newEmployee.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!newEmployee.phone.trim() || !/^\d{10}$/.test(newEmployee.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);
      const addedEmployee = await httpService.post<Employee>(
        "employee",
        newEmployee,
        true
      );
      setEmployees([...employees, addedEmployee]);
      setNewEmployee({
        full_name: "",
        department_id: 0,
        email: "",
        phone: "",
        password: "",
        role_id: 0,
      });
      setError("");
      setLoading(false);
      setIsModalOpen(false);
    } catch (error) {
      setLoading(false);
      setError(`Failed to add employee.${error}`);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditEmployee(employee);
  };

  const handleUpdateEmployee = async () => {
    if (!editEmployee) return;

    if (!editEmployee.full_name.trim()) {
      setError("Employee name cannot be empty.");
      return;
    }

    if (!editEmployee.department_id || editEmployee.department_id <= 0) {
      setError("Department cannot be empty or zero.");
      return;
    }

    if (
      !editEmployee.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmployee.email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!editEmployee.phone.trim() || !/^\d{10}$/.test(editEmployee.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const updatedEmployee = await httpService.patch<Employee>(
        `employee/${editEmployee.id}`,
        editEmployee
      );
      const updatedEmployees = employees.map((emp) =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      );
      setEmployees(updatedEmployees);
      setEditEmployee(null);
      setError("");
    } catch (error) {
      setError("Failed to update employee.");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      await httpService.delete(`employee/${id}`);
      const updatedEmployees = employees.filter((emp) => emp.id !== id);
      setEmployees(updatedEmployees);
    } catch (error) {
      setError("Failed to delete employee.");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">Employee Management</h2>

      {/* Search Field */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className={`w-full pl-10 pr-4 py-2 border ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <FaSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={openModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 mb-6"
        >
          Add New Employee
        </button>
      </div>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-transparent backdrop-blur-xs z-40"></div>
          <div className="fixed inset-0 shadow-2xl flex items-center justify-center z-50">
            <div
              className={`w-full max-w-md p-6 rounded-lg border-2 border-black ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Employee</h3>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-full ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  } transition-all duration-300`}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newEmployee.full_name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="Employee Name"
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                <select
                  value={newEmployee.department_id}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      department_id: Number(e.target.value),
                    })
                  }
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value={0}>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  placeholder="Email Address"
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  placeholder="Password"
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, phone: e.target.value })
                  }
                  placeholder="Phone Number (10 digits)"
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {/* Role Dropdown (Moved after Phone Field) */}
                <select
                  value={newEmployee.role_id}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      role_id: Number(e.target.value),
                    })
                  }
                  className={`w-full p-2 border ${
                    darkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-gray-300 bg-white"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value={0}>Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddEmployee}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </div>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </>
      )}

      <div
        className={`shadow rounded-lg p-8  ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Employee List</h3>
        {filteredEmployees.length === 0 ? (
          <p className="text-gray-500">No employees found.</p>
        ) : (
          <>
            <div className="overflow-x-auto  ">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={`border-b ${
                        darkMode
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-all duration-300`}
                    >
                      <td className="p-3">{emp.id}</td>

                      {/* Name */}
                      <td className="p-3">
                        {editEmployee?.id === emp.id ? (
                          <input
                            type="text"
                            value={editEmployee.full_name}
                            onChange={(e) =>
                              setEditEmployee({
                                ...editEmployee,
                                full_name: e.target.value,
                              })
                            }
                            className={`p-2 border ${
                              darkMode
                                ? "border-gray-700 bg-gray-800 text-white"
                                : "border-gray-300 bg-white"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          />
                        ) : (
                          emp.full_name
                        )}
                      </td>

                      {/* Department */}
                      <td className="p-3">
                        {editEmployee?.id === emp.id ? (
                          <select
                            value={editEmployee.department_id}
                            onChange={(e) =>
                              setEditEmployee({
                                ...editEmployee,
                                department_id: Number(e.target.value),
                              })
                            }
                            className={`p-2 border ${
                              darkMode
                                ? "border-gray-700 bg-gray-800 text-white"
                                : "border-gray-300 bg-white"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          >
                            <option value={0}>Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          departments.find(
                            (dept) => dept.id === emp.department_id
                          )?.name || "N/A"
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-3">
                        {editEmployee?.id === emp.id ? (
                          <input
                            type="email"
                            value={editEmployee.email}
                            onChange={(e) =>
                              setEditEmployee({
                                ...editEmployee,
                                email: e.target.value,
                              })
                            }
                            className={`p-2 border ${
                              darkMode
                                ? "border-gray-700 bg-gray-800 text-white"
                                : "border-gray-300 bg-white"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          />
                        ) : (
                          emp.email
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-3">
                        {editEmployee?.id === emp.id ? (
                          <input
                            type="tel"
                            value={editEmployee.phone}
                            onChange={(e) =>
                              setEditEmployee({
                                ...editEmployee,
                                phone: e.target.value,
                              })
                            }
                            className={`p-2 border ${
                              darkMode
                                ? "border-gray-700 bg-gray-800 text-white"
                                : "border-gray-300 bg-white"
                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          />
                        ) : (
                          emp.phone
                        )}
                      </td>

                      <td className="p-3 relative">
                        <div className="relative">
                          <div className="inline-flex items-center">
                            <label className="flex items-center cursor-pointer relative">
                              <input
                                type="checkbox"
                                checked={editEmployee?.id === emp.id}
                                onChange={() => {
                                  if (editEmployee?.id === emp.id) {
                                    setEditEmployee(null);
                                  } else {
                                    handleEditEmployee(emp);
                                  }
                                }}
                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                id={`check-${emp.id}`}
                              />
                              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  stroke="currentColor"
                                  strokeWidth="1"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              {Array.from(
                { length: Math.ceil(filteredEmployees.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`mx-1 px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-700"
                    } hover:bg-indigo-500 hover:text-white transition-all duration-300`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Employees;
