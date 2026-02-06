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
  withCredentials: true,
});

/* ===========================
   ATTACH TOKEN AUTOMATICALLY
=========================== */
api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
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
      localStorage.clear();

      if (window.location.pathname.startsWith("/admin")) {
        window.location.replace("/admin/login");
      } else {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
