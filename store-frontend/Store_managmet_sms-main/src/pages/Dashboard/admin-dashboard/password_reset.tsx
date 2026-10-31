import { useState } from "react";
import { FaLock, FaCheck } from "react-icons/fa";
import HttpNetworkService from "../../../services/network";
import SharedPreferencesService from "../../../services/storage";

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

const PasswordReset = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!employeeId) { setError("Employee ID is required."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await http.put(`employee/${employeeId}`, { password: newPassword });
      setSuccess("Password reset successfully.");
      setEmployeeId(""); setNewPassword(""); setConfirm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Password Reset</h1>
        <p className="text-sm text-slate-500">Set a new password for any employee by their ID.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <p className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </p>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              <FaCheck /> {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
            <input
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. 5"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
          >
            <FaLock className="text-xs" />
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;
