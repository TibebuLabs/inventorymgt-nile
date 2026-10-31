// src/components/EmployeeTable.tsx
import { FaEllipsisV } from "react-icons/fa";
import { Employee } from "./types";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  editEmployee: Employee | null;
  onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  darkMode: boolean;
}

const EmployeeTable = ({
  employees,
  onEdit,
  onDelete,
  editEmployee,
  onEditInputChange,
  darkMode,
}: EmployeeTableProps) => {
  return (
    <div className="overflow-x-auto">
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
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={`border-b ${
                darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
              } transition-all duration-300`}
            >
              <td className="p-3">{emp.id}</td>
              <td className="p-3">
                {editEmployee?.id === emp.id ? (
                  <input
                    type="text"
                    value={editEmployee.name}
                    onChange={(e) => onEditInputChange(e, "name")}
                    className={`p-2 border ${
                      darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                ) : (
                  emp.name
                )}
              </td>
              <td className="p-3">
                {editEmployee?.id === emp.id ? (
                  <input
                    type="text"
                    value={editEmployee.departmentName}
                    onChange={(e) => onEditInputChange(e, "departmentName")}
                    className={`p-2 border ${
                      darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                ) : (
                  emp.departmentName
                )}
              </td>
              <td className="p-3">
                {editEmployee?.id === emp.id ? (
                  <input
                    type="email"
                    value={editEmployee.email}
                    onChange={(e) => onEditInputChange(e, "email")}
                    className={`p-2 border ${
                      darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                ) : (
                  emp.email
                )}
              </td>
              <td className="p-3">
                {editEmployee?.id === emp.id ? (
                  <input
                    type="tel"
                    value={editEmployee.phone}
                    onChange={(e) => onEditInputChange(e, "phone")}
                    className={`p-2 border ${
                      darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                ) : (
                  emp.phone
                )}
              </td>
              <td className="p-3">
                <div className="relative">
                  <button
                    className={`p-2 rounded-full ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    } transition-all duration-300`}
                  >
                    <FaEllipsisV />
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                      darkMode ? "bg-gray-700" : "bg-white"
                    } z-10`}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => onEdit(emp)}
                        className={`block w-full px-4 py-2 text-sm ${
                          darkMode ? "text-white hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(emp.id)}
                        className={`block w-full px-4 py-2 text-sm ${
                          darkMode ? "text-white hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;