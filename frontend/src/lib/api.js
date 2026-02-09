import axios from "axios";

const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();

const normalizeApiBase = (value) => {
  if (!value) return value;

  const withoutTrailingSlash = value.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/api")) return withoutTrailingSlash;

  return `${withoutTrailingSlash}/api`;
};

const API_URL = normalizeApiBase(rawApiUrl);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ok to keep (cookies), but we will also support Bearer token
});

const clearUserAuth = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("isLoggedIn");
};

const clearAdminAuth = () => {
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminToken"); // ✅ IMPORTANT
};

/* ===========================
   ATTACH TOKEN AUTOMATICALLY
=========================== */
api.interceptors.request.use(
  (config) => {
    const url = typeof config.url === "string" ? config.url : "";
    const isAdminRequest =
      url.startsWith("/admin") || window.location.pathname.startsWith("/admin");

    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    if (isAdminRequest && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (!isAdminRequest && userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===========================
   HANDLE TOKEN EXPIRY
=========================== */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (window.location.pathname.startsWith("/admin")) {
        clearAdminAuth();
        window.location.replace("/admin/login");
      } else {
        clearUserAuth();
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
