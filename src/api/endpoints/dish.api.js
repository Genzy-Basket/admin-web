import axiosClient from "../axiosClient";

export const dishApi = {
  getAll: async (filters = {}) => {
    const response = await axiosClient.get("/dish", { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/dish/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post("/dish", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/dish/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/dish/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await axiosClient.get("/dish/search", {
      params: { q: query },
    });
    return response.data;
  },
};
