import axios from "axios";
import { errorBus } from "./errorBus";

const PUBLIC_ENDPOINTS = ["/auth/admin/login", "/auth/register", "/auth/login"];

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request: attach token ─────────────────────────────────────────────────────
axiosClient.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ENDPOINTS.some(
    (ep) => config.url === ep || config.url?.endsWith(ep),
  );

  if (!isPublic) {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ── Response: normalize errors and surface them via errorBus ──────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";

    if (error.response) {
      const { status, data } = error.response;
      message = data?.message || message;

      if (status === 401) {
        const isLoginPage = window.location.pathname.includes("/login");
        if (!isLoginPage) {
          // Let ToastProvider's auth:logout listener handle the redirect + cleanup
          window.dispatchEvent(new Event("auth:logout"));
          return Promise.reject(new Error(message));
        }
      }

      if (status === 403) {
        message = data?.message || "You don't have permission to perform this action.";
      }
    } else if (error.request) {
      message = "Network error. Please check your connection.";
    }

    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.raw = error;

    return Promise.reject(normalized);
  },
);

export default axiosClient;
