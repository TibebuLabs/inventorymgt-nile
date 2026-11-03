import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface AuthUser {
  id: number;
  fullname: string;
  email: string;
  userRole: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token");
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  // Auto-logout when a request surfaces an expired/invalid token.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  // Redirect away from /login if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && location.pathname === "/login") {
      navigate("/dashboard");
    }
  }, [location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
