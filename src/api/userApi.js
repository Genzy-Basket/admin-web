import axiosClient from "./axiosClient";

export const userApi = {
  getAll: async () => {
    const response = await axiosClient.get("/users");
    return response.data;
  },

  toggleStatus: async (userId) => {
    const response = await axiosClient.patch(`/users/${userId}/status`);
    return response.data;
  },

  delete: async (userId) => {
    const response = await axiosClient.delete(`/users/${userId}`);
    return response.data;
  },

  update: async (userId, data) => {
    const response = await axiosClient.put(`/users/${userId}`, data);
    return response.data;
  },
};
