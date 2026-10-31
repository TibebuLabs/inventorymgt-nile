import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import HttpNetworkService from "../../services/network";
import SharedPreferencesService from "../../services/storage";

interface LoginResponse {
  token: string;
  fullname: string;
  email: string;
  userRole: string;
  userId: number;
}

const prefs = SharedPreferencesService.getInstance();
const httpService = new HttpNetworkService(prefs);

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await httpService.post<LoginResponse>(
        "auth/login",
        { email, password },
        true
      );
      if (response.token) {
        prefs.setString("token", response.token);
        login(response.token, {
          id: response.userId,
          fullname: response.fullname,
          email: response.email,
          userRole: response.userRole,
        });
      } else {
        setError("Login failed — no token received.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg.replace(/^(Unauthorized|Bad request): /, ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* ── Left panel — branding ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-600 p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/40" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-700/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/20" />

        {/* logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Nile Insurance</span>
          </div>
        </div>

        {/* headline */}
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Nile Insurance Company<br />Store Management System
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Smart, efficient, and responsive store management solution — track inventory, manage goods receiving notes,
            process store requisitions, issue vouchers and monitor stock levels in real-time.
          </p>

          {/* feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {["GRN & SRN Management", "Stock Control Cards", "Real-time Notifications", "Role-Based Access", "Dark/Light Mode"].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-full font-medium backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} Store Management System
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 dark:text-white">Nile Insurance</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  hover:border-slate-300 dark:hover:border-slate-500 transition bg-white dark:bg-slate-800"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    hover:border-slate-300 dark:hover:border-slate-500 transition bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl transition-all duration-200
                flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-10">
            &copy; {new Date().getFullYear()} Nile Insurance Company - Store Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
