import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SignIn } from "./pages/Auth/SignIn";
import { AuthProvider } from "./context/AuthContext";
import PasswordReset from "./pages/Dashboard/admin-dashboard/password_reset";
import Departments from "./pages/Dashboard/admin-dashboard/departments";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useState } from "react";
import GoodReceivingInput from "./pages/Dashboard/Goods_receving_note/GoodReceivingInput";
import ViewReceivingGoods from "./pages/Dashboard/Goods_receving_note/GoodReceivingView";
import StoreIssueVoucher from "./pages/Dashboard/admin-dashboard/store_issue_voucher/store_issu_voucherview";
import StoreIssueVoucherInput from "./pages/Dashboard/admin-dashboard/store_issue_voucher/store_issue_voucher";
import ViewStockControlCard from "./pages/Dashboard/admin-dashboard/stock_control_card/stock_control_view";
import RequisitionForm from "./pages/Dashboard/admin-dashboard/store_requstion/RequisitionForm";
import StatusPage from "./pages/Dashboard/admin-dashboard/store_requstion/StatusPage";
import Roles from "./pages/Dashboard/admin-dashboard/role";
import GRNList from "./pages/Dashboard/Goods_receving_note/components/list_view";
import RequisitionView from "./pages/Dashboard/admin-dashboard/store_requstion/RequisitionView";
import Employees from "./pages/Dashboard/admin-dashboard/employes";
import StoreIssueVoucherList from "./pages/Dashboard/admin-dashboard/store_issue_voucher/list-view";
import Admindashboard from "./pages/Dashboard/admin-dashboard/Admindash";
import DepartmentHeadDashboard from "./pages/Dashboard/page-dashboard/DepartmentHeadDashboard";
import StoreManagerDashboard from "./pages/Dashboard/page-dashboard/manger-page/StoreManagerDashboard";
import StoreIssueVoucherDetail from "./pages/Dashboard/admin-dashboard/store_issue_voucher/store_issu_voucherview";

function App() {
  const [goods, setGoods] = useState<GoodReceivingNot[]>([]); // State to store goods data

  const handleAddGood = (good: GoodReceivingNot) => {
    console.log("New good added:", good);
    setGoods((prevGoods) => [...prevGoods, good]); // Add the new good to the list
  };

  const handleUpdateGood = (updatedGood: GoodReceivingNot) => {
    setGoods((prevGoods) =>
      prevGoods.map((good) =>
        good.serial_no === updatedGood.serial_no ? updatedGood : good
      )
    );
  };

  const handleDeleteGood = (serial_no: number) => {
    setGoods((prevGoods) =>
      prevGoods.filter((good) => good.serial_no !== serial_no)
    );
  };

  const handleApproveGood = (serial_no: number) => {
    console.log("Good approved:", serial_no);
    // Add your approval logic here
  };

  const handleAddVoucher = (voucher: StoreIssueVoucher) => {
    console.log("New voucher added:", voucher);
    // Add your logic to handle the new voucher
  };

  const handleAddRequisition = (data: any) => {
    console.log("New requisition added:", data);
    // Add your logic to handle the new requisition
  };

  const handleViewRequisition = (data: any) => {
    console.log("Viewing requisition:", data);
    // Add your logic to handle viewing requisitions
  };

  const routeList = (role: string) => {
    if (role === "admin") {
      return (
        <Route path="/dashboard" element={<Dashboard role="admin" />}>
          <Route path="Admindashboard" element={<Admindashboard />} />

          <Route index element={<Admindashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="roles" element={<Roles />} />
        </Route>
      );
    } else if (role === "store-keeper") {
      return (
        <Route path="/dashboard" element={<Dashboard role="store-keeper" />}>
          {/* StoreManagerDashboard */}
          {/* <Route path="StoreManagerDashboard" element={<StoreManagerDashboard />} /> */}

          <Route path="grn-details/:id" element={<ViewReceivingGoods />} />
          <Route
            path="good-receiving-input"
            element={
              <GoodReceivingInput
                onAddGood={handleAddGood}
                darkMode={false} // You can make this dynamic if needed
              />
            }
          />
          <Route
            path="view-receiving-goods"
            element={
              <ViewReceivingGoods
                goods={goods} // Pass the goods data here
                darkMode={false} // You can make this dynamic if needed
                onUpdateGood={handleUpdateGood}
                onDeleteGood={handleDeleteGood}
                onApproveGood={handleApproveGood}
              />
            }
          />
          <Route
            path="list-view"
            element={
              <GRNList
                goods={goods} // Pass the goods data here
                darkMode={false} // You can make this dynamic if needed
              />
            }
          />
        </Route>
      );
    } else if (role === "store-manager") {
      return (
        <Route path="/dashboard" element={<Dashboard role="store-manager" />}>
          <Route index element={<StoreManagerDashboard />} />

          <Route
            path="StoreManagerDashboard"
            element={<StoreManagerDashboard />}
          />

          <Route
            path="store-issue-voucher/:id"
            element={<StoreIssueVoucherDetail />}
          />

          <Route
            path="StoreIssueVoucherList"
            element={<StoreIssueVoucherList />}
          />
          <Route
            path="store-issue-voucher-input"
            element={
              <StoreIssueVoucherInput
                onAddVoucher={handleAddVoucher}
                darkMode={false}
              />
            }
          />
          <Route
            path="StoreIssueVoucherList"
            element={<ViewStockControlCard />}
          />
          <Route
            path="ViewStockControlCard"
            element={<ViewStockControlCard />}
          />
          <Route path="grn-details/:id" element={<ViewReceivingGoods />} />

          <Route
            path="ViewReceivingGoods"
            element={
              <ViewReceivingGoods
                goods={goods} // Pass the goods data here
                darkMode={false} // You can make this dynamic if needed
                onUpdateGood={handleUpdateGood}
                onDeleteGood={handleDeleteGood}
                onApproveGood={handleApproveGood}
              />
            }
          />
        </Route>
      );
    } else if (role === "employee") {
      return (
        <Route path="/dashboard" element={<Dashboard role="employee" />}>
          <Route
            path="RequisitionForm"
            element={
              <RequisitionForm onAddRequisition={handleAddRequisition} />
            }
          />
          <Route path="StatusPage" element={<StatusPage />} />
          <Route path="password-reset" element={<PasswordReset />} />
        </Route>
      );
    } else if (role === "department-head") {
      return (
        <Route path="/dashboard" element={<Dashboard role="department-head" />}>
          <Route
            path="DepartmentHeadDashboard"
            element={<DepartmentHeadDashboard />}
          />

          <Route
            path="RequisitionView"
            element={
              <RequisitionView onViewRequisition={handleViewRequisition} />
            }
          />
        </Route>
      );
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          {routeList("admin")} {/* Default role for testing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
