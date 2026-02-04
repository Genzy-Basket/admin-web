import axiosClient from "./axiosClient";

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post("/auth/admin/login", credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const getStoredAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    return {
      token,
      user: JSON.parse(user),
    };
  }

  return null;
};

export const setStoredAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const adminLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
