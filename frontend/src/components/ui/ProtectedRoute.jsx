// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import AdminRoute from "../../auth/AdminRoute.jsx";

// 🔐 Protect Normal User Routes
export function UserProtectedRoute({ children }) {
  const token = localStorage.getItem("userToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// 🔐 Protect Admin Only Pages
export function AdminProtectedRoute({ children }) {
  return <AdminRoute>{children}</AdminRoute>;
}
