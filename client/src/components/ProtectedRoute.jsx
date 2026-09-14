import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { token, role: currentRole } = useAuth();

  if (!token) {
    return <Navigate to={role === "admin" ? "/admin-login" : "/login"} replace />;
  }
  if (role && currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
