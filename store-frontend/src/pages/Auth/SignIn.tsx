import { useState } from "react";
import { Button, Typography } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import HttpNetworkService from "../../services/network";
import { useAuth } from "../../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import SharedPreferencesService from "../../services/storage";

export const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const prefs = SharedPreferencesService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const httpService = new HttpNetworkService(prefs);
     
      const response = await httpService.post<{ token: string }>(
        "auth/login",
        { email, password },
        true
      );

      if (response.token) {
        login(response.token);
        navigate("/dashboard"); // Redirect to dashboard after successful login
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        `Login failed. Please check your credentials and try again.${err}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-2xl w-full sm:w-96 mx-4">
          <h2 className="text-center text-3xl font-extrabold text-gray-800 mb-6">
            Sign In
          </h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none transition duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4 relative">
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none transition duration-200 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              className="py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
              disabled={isLoading}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              {isLoading ? (
                <div className="flex items-center">
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
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}

          <div className="mt-6 text-center">
            <Typography
              variant="small"
              className="text-gray-600"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              Don't have an account?{" "}
              <Link
                to="/auth/sign-up"
                className="text-indigo-600 hover:underline"
              >
                Sign up
              </Link>
            </Typography>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
          <Typography
            variant="small"
            className="text-gray-600"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            &copy; 2025 Store Management. All rights reserved.
          </Typography>
        </div>
      </footer>
    </div>
  );
};
