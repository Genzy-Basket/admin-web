import axiosClient from "../axiosClient";

export const userApi = {
  // Admin User Queries
  getAll: async (params) => {
    const response = await axiosClient.get("/user/admin/all", { params });
    return response.data; // { success, data, pagination }
  },

  getStats: async () => {
    const response = await axiosClient.get("/user/admin/stats");
    return response.data;
  },

  getById: async (userId) => {
    const response = await axiosClient.get(`/user/admin/${userId}`);
    return response.data; // { success, data: user }
  },

  // Admin Actions
  approve: async (userId) => {
    const response = await axiosClient.patch(`/user/admin/${userId}/approve`);
    return response.data;
  },

  reject: async (userId, reason) => {
    const response = await axiosClient.patch(`/user/admin/${userId}/reject`, {
      reason,
    });
    return response.data;
  },

  suspend: async (userId, reason) => {
    const response = await axiosClient.patch(`/user/admin/${userId}/suspend`, {
      reason,
    });
    return response.data;
  },

  reactivate: async (userId) => {
    const response = await axiosClient.patch(
      `/user/admin/${userId}/reactivate`,
    );
    return response.data;
  },
};
