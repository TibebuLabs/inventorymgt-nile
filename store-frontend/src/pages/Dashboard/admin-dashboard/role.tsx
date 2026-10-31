import { useEffect, useState } from "react";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

interface Role {
  id: number;
  role_name: string;
}

const prefs = SharedPreferencesService.getInstance();
const httpService = new HttpNetworkService(prefs);

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRole, setNewRole] = useState<string>("");
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await httpService.get<any>("role");
      console.log("API Response:", response);

      let rolesData = response;
      if (response && response.data) {
        rolesData = response.data;
      }

      if (Array.isArray(rolesData)) {
        const sanitizedRoles = rolesData
          .map((role: any) => ({
            id: role?.id || 0,
            role_name: role?.role || role?.role_name || "",
          }))
          .filter((role) => role.role_name && role.id);

        setRoles(sanitizedRoles);
      } else {
        setError("Invalid data format received from server");
        setRoles([]);
      }
    } catch (error) {
      setError("Failed to fetch roles.");
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      const response = await httpService.post<any>(
        "role",
        { role: newRole },
        true
      );

      if (response && (response.data || response)) {
        const addedRole = response.data || response;

        if (
          addedRole &&
          addedRole.id &&
          (addedRole.role || addedRole.role_name)
        ) {
          const newRoleItem = {
            id: addedRole.id,
            role_name: addedRole.role || addedRole.role_name,
          };

          setRoles((prevRoles) => [...prevRoles, newRoleItem]);
          setNewRole("");
          setError("");
          setSuccess("Role added successfully!");
        } else {
          setError("Invalid response format after adding role");
        }
      } else {
        setError("Failed to add role. Please try again.");
      }
    } catch (err: any) {
      console.error("Error adding role:", err);
      setError(err.message || "Failed to add role. Please try again.");
    }
  };

  const handleUpdateRole = async () => {
    if (!editRole?.role_name.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      const response = await httpService.patch<any>(
        `role/${editRole.id}`,
        { role: editRole.role_name },
        true
      );

      const updatedRole = response.data || response;

      if (
        updatedRole &&
        updatedRole.id &&
        (updatedRole.role || updatedRole.role_name)
      ) {
        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === updatedRole.id
              ? {
                  ...role,
                  role_name: updatedRole.role || updatedRole.role_name,
                }
              : role
          )
        );
        setEditRole(null);
        setError("");
        setSuccess("Role updated successfully!");
      } else {
        setError("Invalid response format after updating role");
      }
    } catch (err: any) {
      console.error("Error updating role:", err);
      setError(err.message || "Failed to update role. Please try again.");
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      await httpService.delete(`role/${id}`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
      setSuccess("Role deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting role:", err);
      setError(err.message || "Failed to delete role. Please try again.");
    }
  };

  const filteredRoles = roles.filter((role) => {
    return role.role_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <p>Loading roles...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">Role Management</h2>

      {/* Notification Area */}
      {(success || error) && (
        <div className="fixed top-4 right-4 z-50">
          {success && (
            <div className="flex items-center bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2">
              <FaCheck className="mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
              <FaTimes className="mr-2" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
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

      {/* Add Role Form */}
      <div
        className={`shadow rounded-lg p-6 mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Add New Role</h3>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddRole()}
            placeholder="Enter role name"
            className={`flex-1 p-2 border ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-300 bg-white"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <button
            onClick={handleAddRole}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Role List */}
      <div
        className={`shadow rounded-lg p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Role List</h3>
        {filteredRoles.length === 0 ? (
          <p className="text-gray-500">No roles found.</p>
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
                {filteredRoles.map((role) => (
                  <tr
                    key={role.id}
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-all duration-300`}
                  >
                    <td className="p-3">{role.id}</td>
                    <td className="p-3">
                      {editRole?.id === role.id ? (
                        <input
                          type="text"
                          value={editRole.role_name}
                          onChange={(e) =>
                            setEditRole({
                              ...editRole,
                              role_name: e.target.value,
                            })
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleUpdateRole()
                          }
                          className={`p-2 border ${
                            darkMode
                              ? "border-gray-700 bg-gray-800 text-white"
                              : "border-gray-300 bg-white"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      ) : (
                        role.role_name
                      )}
                    </td>
                    <td className="p-3 flex items-center space-x-4">
                      {editRole?.id === role.id ? (
                        <>
                          <button
                            onClick={handleUpdateRole}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-all duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditRole(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditRole(role)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
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

export default Roles;
