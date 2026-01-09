import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    // Decode JWT payload manually
    const payload = JSON.parse(atob(token.split(".")[1]));

    // Check expiry
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("adminToken");
      return <Navigate to="/admin/login" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }
}
