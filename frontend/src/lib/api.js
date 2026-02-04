import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

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
