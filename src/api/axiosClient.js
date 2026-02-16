import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/auth/admin/login",
      "/auth/register",
      "/auth/login",
    ];
    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) => config.url === endpoint || config.url?.endsWith(endpoint),
    );

    if (!isPublicEndpoint) {
      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("token");

      // Use admin token if available, otherwise use user token
      const token = adminToken || userToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        alert("No token found");
      }
    } else {
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens
      console.log("401 Unauthorized - clearing tokens");

      // Only redirect if not already on login page
      const isLoginPage = window.location.pathname.includes("/login");

      if (!isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        // Redirect to appropriate login page
        const isAdminRoute = window.location.pathname.includes("/admin");
        window.location.href = isAdminRoute ? "/admin/login" : "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.log("403 Forbidden - insufficient permissions");
      // Optionally show a notification
      // toast.error("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      console.log("404 Not Found");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
