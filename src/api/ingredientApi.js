import axiosClient from "./axiosClient";

export const ingredientApi = {
  getAll: async () => {
    const response = await axiosClient.get("/ingredient");
    return response.data;
  },

  add: async (data) => {
    const response = await axiosClient.post("/ingredient", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/ingredient/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/ingredient/${id}`);
    return response.data;
  },
};
