import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Define a simple User interface. Adjust properties as needed.
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize isAuthenticated from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("token");
    return !!token;
  });

  // Initialize user from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  const login = (token: string, userData: User) => {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (location.pathname === "/login") {
        navigate("/dashboard");
      }
    }
  }, [location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
