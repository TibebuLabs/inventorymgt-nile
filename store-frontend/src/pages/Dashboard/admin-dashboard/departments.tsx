// import { useState } from "react";

// interface Department {
//   id: number;
//   name: string;
// }

// const Departments = () => {
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [newDepartment, setNewDepartment] = useState<string>("");
//   const [editDepartment, setEditDepartment] = useState<Department | null>(null);
//   const [error, setError] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [darkMode, setDarkMode] = useState<boolean>(false);

//   // Add a new department
//   const handleAddDepartment = () => {
//     if (!newDepartment.trim()) {
//       setError("Department name cannot be empty.");
//       return;
//     }
//     const newDept: Department = {
//       id: Date.now(),
//       name: newDepartment,
//     };
//     setDepartments([...departments, newDept]);
//     setNewDepartment("");
//     setError("");
//   };

//   // Edit an existing department
//   const handleEditDepartment = (department: Department) => {
//     setEditDepartment(department);
//   };

//   // Update an existing department
//   const handleUpdateDepartment = () => {
//     if (!editDepartment?.name.trim()) {
//       setError("Department name cannot be empty.");
//       return;
//     }
//     const updatedDepartments = departments.map((dept) =>
//       dept.id === editDepartment.id
//         ? { ...dept, name: editDepartment.name }
//         : dept
//     );
//     setDepartments(updatedDepartments);
//     setEditDepartment(null);
//     setError("");
//   };

//   // Delete a department
//   const handleDeleteDepartment = (id: number) => {
//     const updatedDepartments = departments.filter((dept) => dept.id !== id);
//     setDepartments(updatedDepartments);
//   };

//   // Filter departments based on search query
//   const filteredDepartments = departments.filter((dept) =>
//     dept.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   return (
//     <div
//       className={`min-h-screen p-6 ${
//         darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
//       }`}
//     >
//       <h2 className="text-2xl font-bold mb-6">Department Management</h2>

//       {/*
//       <button
//         onClick={toggleDarkMode}
//         className={`fixed top-4 right-4 p-2 rounded-full ${
//           darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"
//         } hover:bg-indigo-500 hover:text-white transition-all duration-300`}
//       >
//         {darkMode ? "🌙" : "☀️"}
//       </button> */}

//       {/* Search Bar */}
//       <div className="mb-6">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search departments..."
//           className={`w-full p-2 border ${
//             darkMode
//               ? "border-gray-700 bg-gray-800 text-white"
//               : "border-gray-300 bg-white"
//           } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//         />
//       </div>

//       {/* Add Department Form */}
//       <div
//         className={`shadow rounded-lg p-6 mb-6 ${
//           darkMode ? "bg-gray-800" : "bg-white"
//         }`}
//       >
//         <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
//         <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
//           <input
//             type="text"
//             value={newDepartment}
//             onChange={(e) => setNewDepartment(e.target.value)}
//             placeholder="Enter department name"
//             className={`flex-1 p-2 border ${
//               darkMode
//                 ? "border-gray-700 bg-gray-800 text-white"
//                 : "border-gray-300 bg-white"
//             } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//           />
//           <button
//             onClick={handleAddDepartment}
//             className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
//           >
//             Add
//           </button>
//         </div>
//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//       </div>

//       {/* Department List */}
//       <div
//         className={`shadow rounded-lg p-6 ${
//           darkMode ? "bg-gray-800" : "bg-white"
//         }`}
//       >
//         <h3 className="text-lg font-semibold mb-4">Department List</h3>
//         {filteredDepartments.length === 0 ? (
//           <p className="text-gray-500">No departments found.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
//                   <th className="p-3 text-left">ID</th>
//                   <th className="p-3 text-left">Name</th>
//                   <th className="p-3 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredDepartments.map((dept) => (
//                   <tr
//                     key={dept.id}
//                     className={`border-b ${
//                       darkMode
//                         ? "border-gray-700 hover:bg-gray-700"
//                         : "border-gray-200 hover:bg-gray-50"
//                     } transition-all duration-300`}
//                   >
//                     <td className="p-3">{dept.id}</td>
//                     <td className="p-3">
//                       {editDepartment?.id === dept.id ? (
//                         <input
//                           type="text"
//                           value={editDepartment.name}
//                           onChange={(e) =>
//                             setEditDepartment({
//                               ...editDepartment,
//                               name: e.target.value,
//                             })
//                           }
//                           className={`p-2 border ${
//                             darkMode
//                               ? "border-gray-700 bg-gray-800 text-white"
//                               : "border-gray-300 bg-white"
//                           } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                         />
//                       ) : (
//                         dept.name
//                       )}
//                     </td>
//                     <td className="p-3 flex items-center space-x-4">

//                       {editDepartment?.id === dept.id ? (
//                         <>
//                           <button
//                             onClick={handleUpdateDepartment}
//                             className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
//                           >
//                             Save
//                           </button>
//                           <button
//                             onClick={() => setEditDepartment(null)}
//                             className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-all duration-300"
//                           >
//                             Cancel
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => handleEditDepartment(dept)}
//                             className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleDeleteDepartment(dept.id)}
//                             className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
//                           >
//                             Delete
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Departments;
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa"; // Import search icon from React Icons
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

interface Department {
  id: number;
  department_name: string;
}

const prefs = SharedPreferencesService.getInstance();
const httpService = new HttpNetworkService(prefs);

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState<string>("");
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Fetch departments from API
  useEffect(() => {
    fetchDepartment();
  }, []);

  const fetchDepartment = async () => {
    try {
      const dep = await httpService.get<Department[]>("department");
      console.log("API Response:", dep); // Log the API response
      const sanitizedDepartmnt = dep.map((dp) => ({
        id: dp.id,
        department_name: dp.department_name,
      }));
      setDepartments(sanitizedDepartmnt);
    } catch (error) {
      setError("Failed to fetch departments.");
    }
  };

  // Add a new department (POST)
  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      setError("Department name cannot be empty.");
      return;
    }
    const newDept = { department_name: newDepartment };

    try {
      const data = await httpService.post<Department>(
        "department",
        newDept,
        true
      );
      console.log(data);
      setDepartments([...departments, data]);
      setNewDepartment("");
      setError("");
    } catch (err) {
      console.error("Error adding department:", err);
    }
  };

  // Update an existing department (PUT)
  const handleUpdateDepartment = async () => {
    if (!editDepartment?.department_name.trim()) {
      setError("Department name cannot be empty.");
      return;
    }
    try {
      const updatedDept = await httpService.patch<Department>(
        `department/${editDepartment.id}`,
        editDepartment,
        true
      );
      setDepartments(
        departments.map((dept) =>
          dept.id === updatedDept.id ? updatedDept : dept
        )
      );
      setEditDepartment(null);
      setError("");
    } catch (err) {
      console.error("Error updating department:", err);
    }
  };

  // Delete a department (DELETE)
  const handleDeleteDepartment = async (id: number) => {
    console.log(id);
    try {
      await httpService.delete(`department/${id}`);
      setDepartments(departments.filter((dept) => dept.id !== id));
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter((dept) =>
    dept.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">Department Management</h2>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments..."
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

      {/* Add Department Form */}
      <div
        className={`shadow rounded-lg p-6 mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="Enter department name"
            className={`flex-1 p-2 border ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <button
            onClick={handleAddDepartment}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Department List */}
      <div
        className={`shadow rounded-lg p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Department List</h3>
        {filteredDepartments.length === 0 ? (
          <p className="text-gray-500">No departments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-all duration-300`}
                  >
                    <td className="p-3">{dept.id}</td>
                    <td className="p-3">
                      {editDepartment?.id === dept.id ? (
                        <input
                          type="text"
                          value={editDepartment.department_name}
                          onChange={(e) =>
                            setEditDepartment({
                              ...editDepartment,
                              department_name: e.target.value,
                            })
                          }
                          className={`p-2 border ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white"
                              : "border-gray-300 bg-white"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      ) : (
                        dept.department_name
                      )}
                    </td>
                    <td className="p-3 flex items-center space-x-4">
                      {editDepartment?.id === dept.id ? (
                        <>
                          <button
                            onClick={handleUpdateDepartment}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditDepartment(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditDepartment(dept)} // This should set the department to be edited
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
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
