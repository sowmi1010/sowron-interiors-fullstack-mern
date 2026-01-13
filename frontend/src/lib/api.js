import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
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
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminName");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("isLoggedIn");

      if (window.location.pathname.startsWith("/admin")) {
        window.location.replace("/admin/login");
      } else {
        window.location.replace("/login");
      }
    }

    return Promise.reject(err);
  }
);
