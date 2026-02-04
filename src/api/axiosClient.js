import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Request interceptor to add auth token
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// Request interceptor to add auth token
// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    console.log("Request URL:", config.url); // Debug log

    // Skip adding token for authentication endpoints
    const publicEndpoints = ["/auth/admin/login", "/auth/register"];
    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) => config.url === endpoint || config.url?.endsWith(endpoint),
    );

    console.log("Is public endpoint:", isPublicEndpoint); // Debug log

    if (!isPublicEndpoint) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token added to request"); // Debug log
      }
    } else {
      console.log("Skipping token for public endpoint"); // Debug log
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      const isLoginPage = window.location.pathname === "/login";

      if (!isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
