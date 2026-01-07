// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

// 🔐 Protect Normal User Routes
export function UserProtectedRoute({ children }) {
  const token = localStorage.getItem("userToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// 🔐 Protect Admin Only Pages
export function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
