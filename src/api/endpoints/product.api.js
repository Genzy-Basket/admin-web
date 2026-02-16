// src/api/endpoints/product.api.js
import axiosClient from "../axiosClient";

export const productApi = {
  getAll: async (params = {}) => {
    // Allows passing { category: 'Dairy' } etc.
    const response = await axiosClient.get("/product", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/product/${id}`);
    return response.data;
  },

  add: async (data) => {
    const response = await axiosClient.post("/product", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.patch(`/product/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/product/${id}`);
    return response.data;
  },
};
