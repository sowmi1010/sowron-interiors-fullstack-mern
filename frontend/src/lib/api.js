import axios from "axios";

const API_URL = "http://localhost:5000/api"; // 🔥 LOCAL backend

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // ✅ IMPORTANT
});

/* ===========================
   ATTACH TOKEN AUTOMATICALLY
=========================== */
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
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
