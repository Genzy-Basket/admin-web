import axiosClient from "./axiosClient";

export const ingredientApi = {
  /**
   * Get all ingredients
   * @returns {Promise} Response with all ingredients
   */
  getAll: async () => {
    const response = await axiosClient.get("/ingredient");
    return response.data;
  },

  /**
   * Get single ingredient by ID
   * @param {string} id - Ingredient ID
   * @returns {Promise} Response with single ingredient
   */
  getById: async (id) => {
    const response = await axiosClient.get(`/ingredient/${id}`);
    return response.data;
  },

  /**
   * Create a new ingredient (Admin only)
   * @param {Object} data - Ingredient data
   * @returns {Promise} Response with created ingredient
   */
  add: async (data) => {
    const response = await axiosClient.post("/ingredient", data);
    return response.data;
  },

  /**
   * Update an ingredient (Admin only)
   * @param {string} id - Ingredient ID
   * @param {Object} data - Updated ingredient data
   * @returns {Promise} Response with updated ingredient
   */
  update: async (id, data) => {
    const response = await axiosClient.patch(`/ingredient/${id}`, data);
    return response.data;
  },

  /**
   * Delete an ingredient (Admin only)
   * @param {string} id - Ingredient ID
   * @returns {Promise} Response
   */
  delete: async (id) => {
    const response = await axiosClient.delete(`/ingredient/${id}`);
    return response.data;
  },
};
