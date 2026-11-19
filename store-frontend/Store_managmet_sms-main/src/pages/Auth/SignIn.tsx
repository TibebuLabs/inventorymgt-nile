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
      {/* ── Left panel — branding with teal gradient ──────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-[#0d9488] via-[#14b8a6] to-[#0d9488] p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 backdrop-blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 backdrop-blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 backdrop-blur-3xl" />

        {/* logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Nile Store</span>
          </div>
        </div>

        {/* headline */}
        <div className="relative z-10">
          <h1 className="text-white text-5xl font-bold leading-tight mb-6">
            Store Management<br />System
          </h1>
          <p className="text-green-100 text-lg leading-relaxed max-w-lg">
            Smart, efficient, and responsive platform for managing inventory, goods receiving notes, store requisitions, and real-time stock control.
          </p>

          {/* feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {["📦 GRN & SRN", "📊 Stock Control", "🔔 Notifications", "🔐 Role-Based", "🎨 Dark Mode"].map(f => (
              <span key={f} className="px-4 py-2 bg-white/15 text-white text-sm rounded-full font-medium backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-green-100/70 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Trusted by modern businesses
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0d9488] to-[#0d9488] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">Nile Store</span>
          </div>

          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent
                  hover:border-slate-300 dark:hover:border-slate-600 transition bg-white dark:bg-slate-800"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
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
                  className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent
                    hover:border-slate-300 dark:hover:border-slate-600 transition bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#0d9488] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 animate-slide-up">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#0d9488] to-[#0d9488] hover:from-[#14b8a6] hover:to-[#2dd4bf] active:from-[#0a7e6f] active:to-[#0d9488]
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-semibold rounded-2xl transition-all duration-300
                flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40
                border border-white/10"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-12">
            &copy; {new Date().getFullYear()} Nile Insurance Company Store System
          </p>
        </div>
      </div>
    </div>
  );
};
