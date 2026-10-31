import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./components/ui";
import { SignIn } from "./pages/Auth/SignIn";

// Layout
import Dashboard from "./pages/Dashboard/Dashboard";

// Overview
import Home from "./pages/Dashboard/Home";
import Stock from "./pages/Dashboard/Stock";
import Vendors from "./pages/Dashboard/Vendors";
import AuditLog from "./pages/Dashboard/AuditLog";
import Approvals from "./pages/Dashboard/Approvals";
import Locations from "./pages/Dashboard/Locations";
import NotFound from "./pages/Dashboard/NotFound";

// Admin pages
import Admindashboard from "./pages/Dashboard/admin-dashboard/Admindash";
import Employees from "./pages/Dashboard/admin-dashboard/employes";
import Departments from "./pages/Dashboard/admin-dashboard/departments";
import Roles from "./pages/Dashboard/admin-dashboard/role";
import PasswordReset from "./pages/Dashboard/admin-dashboard/password_reset";
import InventorySetup from "./pages/Dashboard/admin-dashboard/inventory";

// Store-keeper pages
import GoodReceivingInput from "./pages/Dashboard/Goods_receving_note/GoodReceivingInput";
import ViewReceivingGoods from "./pages/Dashboard/Goods_receving_note/GoodReceivingView";
import GRNList from "./pages/Dashboard/Goods_receving_note/components/list_view";

// Store-manager pages
import StoreManagerDashboard from "./pages/Dashboard/page-dashboard/manger-page/StoreManagerDashboard";
import StoreIssueVoucherInput from "./pages/Dashboard/admin-dashboard/store_issue_voucher/store_issue_voucher";
import StoreIssueVoucherList from "./pages/Dashboard/admin-dashboard/store_issue_voucher/list-view";
import StoreIssueVoucherDetail from "./pages/Dashboard/admin-dashboard/store_issue_voucher/store_issu_voucherview";
import ViewStockControlCard from "./pages/Dashboard/admin-dashboard/stock_control_card/stock_control_view";

// Employee pages
import RequisitionForm from "./pages/Dashboard/admin-dashboard/store_requstion/RequisitionForm";
import StatusPage from "./pages/Dashboard/admin-dashboard/store_requstion/StatusPage";
import RequisitionView from "./pages/Dashboard/admin-dashboard/store_requstion/RequisitionView";

// Department-head pages
import DepartmentHeadDashboard from "./pages/Dashboard/page-dashboard/DepartmentHeadDashboard";

type RoleName =
  | "admin"
  | "store-manager"
  | "store-keeper"
  | "employee"
  | "department-head";

// ─── Redirect unauthenticated users to /login ─────────────────────────────────
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ─── Route-level role guard (admin always allowed) ────────────────────────────
const RequireRole = ({
  roles,
  children,
}: {
  roles: RoleName[];
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const role = (user?.userRole ?? "employee") as RoleName;
  if (role === "admin" || roles.includes(role)) return <>{children}</>;
  return <Navigate to="/dashboard" replace />;
};

// ─── Dashboard layout reads role from context — no prop needed ────────────────
const DashboardLayout = () => {
  const { user } = useAuth();
  const role = (user?.userRole ?? "employee") as RoleName;
  return <Dashboard role={role} />;
};

// ─── All routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<SignIn />} />
    <Route path="/password-reset" element={<PasswordReset />} />

    {/* Protected — layout reads role from auth context */}
    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      }
    >
      {/* ── Overview (default for everyone) ────────── */}
      <Route index element={<Home />} />

      {/* ── Shared workflow pages ─────────────────── */}
      <Route
        path="stock"
        element={
          <RequireRole roles={["store-manager", "store-keeper", "department-head"]}>
            <Stock />
          </RequireRole>
        }
      />
      <Route
        path="vendors"
        element={
          <RequireRole roles={["store-manager", "store-keeper"]}>
            <Vendors />
          </RequireRole>
        }
      />
      <Route
        path="locations"
        element={
          <RequireRole roles={["store-manager", "store-keeper", "admin"]}>
            <Locations />
          </RequireRole>
        }
      />
      <Route
        path="audit"
        element={
          <RequireRole roles={["store-manager"]}>
            <AuditLog />
          </RequireRole>
        }
      />
      <Route
        path="approvals"
        element={
          <RequireRole roles={["store-manager", "department-head"]}>
            <Approvals />
          </RequireRole>
        }
      />

      {/* ── Admin ─────────────────────────────────── */}
      <Route path="Admindashboard" element={<Admindashboard />} />
      <Route
        path="employees"
        element={
          <RequireRole roles={["admin", "store-manager"]}>
            <Employees />
          </RequireRole>
        }
      />
      <Route
        path="departments"
        element={
          <RequireRole roles={["admin", "store-manager"]}>
            <Departments />
          </RequireRole>
        }
      />
      <Route
        path="roles"
        element={
          <RequireRole roles={["admin", "store-manager"]}>
            <Roles />
          </RequireRole>
        }
      />
      <Route
        path="inventory"
        element={
          <RequireRole roles={["store-keeper"]}>
            <InventorySetup />
          </RequireRole>
        }
      />
      <Route path="password-reset" element={<PasswordReset />} />

      {/* ── Store-keeper ──────────────────────────── */}
      <Route
        path="good-receiving-input"
        element={
          <RequireRole roles={["store-keeper"]}>
            <GoodReceivingInput />
          </RequireRole>
        }
      />
      <Route path="view-receiving-goods" element={<ViewReceivingGoods />} />
      <Route path="list-view" element={<GRNList />} />
      <Route path="grn-details/:id" element={<ViewReceivingGoods />} />

      {/* ── Store-manager ─────────────────────────── */}
      <Route path="StoreManagerDashboard" element={<StoreManagerDashboard />} />
      <Route
        path="store-issue-voucher-input"
        element={
          <RequireRole roles={["store-manager", "store-keeper"]}>
            <StoreIssueVoucherInput />
          </RequireRole>
        }
      />
      <Route path="StoreIssueVoucherList" element={<StoreIssueVoucherList />} />
      <Route path="store-issue-voucher/:id" element={<StoreIssueVoucherDetail />} />
      <Route path="ViewStockControlCard" element={<ViewStockControlCard />} />
      <Route path="ViewReceivingGoods" element={<ViewReceivingGoods />} />

      {/* ── Employee ──────────────────────────────── */}
      <Route
        path="RequisitionForm"
        element={
          <RequireRole roles={["employee", "department-head", "store-keeper", "store-manager"]}>
            <RequisitionForm />
          </RequireRole>
        }
      />
      <Route
        path="StatusPage"
        element={
          <RequireRole roles={["employee", "department-head", "store-keeper", "store-manager"]}>
            <StatusPage />
          </RequireRole>
        }
      />
      <Route
        path="requests"
        element={
          <RequireRole roles={["employee", "department-head", "store-keeper", "store-manager"]}>
            <StatusPage />
          </RequireRole>
        }
      />

      {/* ── Department Head ───────────────────────── */}
      <Route path="DepartmentHeadDashboard" element={<DepartmentHeadDashboard />} />
      <Route path="RequisitionView" element={<RequisitionView />} />

      {/* ── 404 inside the shell ──────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Route>

    {/* Unknown top-level path */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
