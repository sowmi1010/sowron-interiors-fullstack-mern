import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      // ✅ no token, no need to call backend
      if (!mounted) return;
      setAuthorized(false);
      setChecking(false);
      return;
    }

    api
      .get("/admin/session")
      .then((res) => {
        if (!mounted) return;
        setAuthorized(true);

        if (res.data?.admin?.name) {
          localStorage.setItem("adminName", res.data.admin.name);
        }
      })
      .catch(() => {
        if (!mounted) return;

        // ✅ clear token if invalid/expired
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");

        setAuthorized(false);
      })
      .finally(() => {
        if (!mounted) return;
        setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) return null;
  if (!authorized) return <Navigate to="/admin/login" replace />;
  return children;
}
