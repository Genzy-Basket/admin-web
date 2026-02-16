// src/api/endpoints/auth.api.js
import axiosClient from "../axiosClient";

export const authApi = {
  login: async (credentials) => {
    // credentials = { email, password }
    const response = await axiosClient.post("/auth/admin/login", credentials);
    return response.data;
  },
};

export const storage = {
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  getAuth: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  },
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
