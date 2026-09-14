import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderPage from "./pages/OrderPage";
import CustomerAuth from "./pages/CustomerAuth";
import AdminAuth from "./pages/AdminAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrderStatusPage from "./pages/OrderStatusPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/admin-login" element={<AdminAuth />} />
          <Route path="/track/:id" element={<OrderStatusPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
