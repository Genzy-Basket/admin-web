// src/api/endpoints/dish.api.js
import axiosClient from "../axiosClient";

export const dishApi = {
  getAll: async (params = {}) => {
    const response = await axiosClient.get("/admin/dishes", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/admin/dishes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post("/admin/dishes", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/admin/dishes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/admin/dishes/${id}`);
    return response.data;
  },
};
