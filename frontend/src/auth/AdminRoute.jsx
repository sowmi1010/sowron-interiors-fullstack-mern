import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
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
