import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import HttpNetworkService from "../services/network";
import SharedPreferencesService from "../services/storage";
import { ENDPOINTS } from "../services/endpoints";

interface Notification {
  id: number;
  message: string;
  date: string;
  employee_id: number;
  grn_id?: number | null;
  srn_id?: number | null;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const prefs = SharedPreferencesService.getInstance();
const http = new HttpNetworkService(prefs);

/** Fallback polling interval (ms) in case WebSockets are blocked. */
const POLL_INTERVAL_MS = 30_000;

/**
 * Work out where the realtime server lives.
 * Priority: VITE_WS_URL → VITE_API_BASE_URL (origin only) → same host on :3000.
 */
const resolveSocketUrl = (): string => {
  const explicit = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicit) return explicit.replace(/\/+$/, "");

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch {
      /* fall through */
    }
  }

  if (typeof window !== "undefined" && window.location.port !== "5173") {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Kept in a ref so the socket handler always calls the latest version
  // without re-creating the socket on every render.
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    try {
      const data = await http.get<Notification[]>(
        `${ENDPOINTS.notifications}?employeeId=${user.id}`
      );
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  fetchRef.current = fetchNotifications;

  const markAsRead = useCallback(async (id: number) => {
    try {
      // Optimistic update first — the UI should feel instant.
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      await http.patch(`${ENDPOINTS.notifications}/${id}/read`, {});
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      fetchRef.current();
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await http.patch(
        `${ENDPOINTS.notifications}/read-all?employeeId=${user.id}`,
        {}
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      fetchRef.current();
    }
  }, [user?.id]);

  // Initial load + reload whenever the signed-in user changes.
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Safety net: poll periodically. This keeps the bell correct even when the
  // WebSocket connection cannot be established (proxy/firewall/offline tab).
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const timer = window.setInterval(() => {
      fetchRef.current();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setConnected(false);
      return;
    }

    const token = prefs.getString("token");
    if (!token) return;

    const newSocket = io(resolveSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
      randomizationFactor: 0.5,
      timeout: 20_000,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      // Anything missed while the socket was down is now in the database.
      fetchRef.current();
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      setConnected(false);
      console.error("Socket connection error:", err.message);
    });

    newSocket.on("notification", (payload: Partial<Notification>) => {
      // Refetch so we use the real database row (id, date, read flag) and pick
      // up anything else that arrived while we were away.
      fetchRef.current();

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        window.Notification?.permission === "granted"
      ) {
        try {
          new window.Notification("Nile Insurance — Store Management", {
            body: payload.message ?? "You have a new notification",
            icon: "/vite.svg",
          });
        } catch {
          /* Some browsers block constructor use on insecure origins. */
        }
      }
    });

    setSocket(newSocket);

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification?.permission === "default"
    ) {
      window.Notification.requestPermission().catch(() => {});
    }

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        connected,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
