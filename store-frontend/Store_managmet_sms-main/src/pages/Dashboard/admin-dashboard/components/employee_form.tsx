// src/components/EmployeeForm.tsx
import { FaTimes } from "react-icons/fa";
import { Employee } from "./types";

interface EmployeeFormProps {
  employee: Omit<Employee, "id">;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  error: string;
  darkMode: boolean;
  isEditMode?: boolean;
}

const EmployeeForm = ({
  employee,
  onInputChange,
  onSubmit,
  onClose,
  error,
  darkMode,
  isEditMode = false,
}: EmployeeFormProps) => {
  return (
    <div className={`w-full max-w-md p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{isEditMode ? "Edit Employee" : "Add New Employee"}</h3>
        <button
          onClick={onClose}
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
          value={employee.name}
          onChange={(e) => onInputChange(e, "name")}
          placeholder="Employee Name"
          className={`w-full p-2 border ${
            darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <input
          type="text"
          value={employee.departmentName}
          onChange={(e) => onInputChange(e, "departmentName")}
          placeholder="Department Name"
          className={`w-full p-2 border ${
            darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <input
          type="email"
          value={employee.email}
          onChange={(e) => onInputChange(e, "email")}
          placeholder="Email Address"
          className={`w-full p-2 border ${
            darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <input
          type="tel"
          value={employee.phone}
          onChange={(e) => onInputChange(e, "phone")}
          placeholder="Phone Number (10 digits)"
          className={`w-full p-2 border ${
            darkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <button
          onClick={onSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 w-full"
        >
          {isEditMode ? "Update" : "Add"}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default EmployeeForm;