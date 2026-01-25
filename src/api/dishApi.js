import axiosClient from "./axiosClient";

/**
 * Dish API Functions
 */
export const dishApi = {
  // Get all dishes with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.isVeg !== undefined) {
      params.append("isVeg", filters.isVeg);
    }
    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      filters.dietaryTags.forEach((tag) => params.append("dietaryTags", tag));
    }
    if (filters.maxPrepTime) {
      params.append("maxPrepTime", filters.maxPrepTime);
    }
    if (filters.maxCalories) {
      params.append("maxCalories", filters.maxCalories);
    }

    const queryString = params.toString();
    const url = queryString ? `/dishes?${queryString}` : "/dishes";

    const response = await axiosClient.get(url);
    return response.data;
  },

  // Get single dish by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/dishes/${id}`);
    return response.data;
  },

  // Create new dish
  create: async (dishData) => {
    const response = await axiosClient.post("/dishes", dishData);
    return response.data;
  },

  // Update existing dish
  update: async (id, dishData) => {
    const response = await axiosClient.put(`/dishes/${id}`, dishData);
    return response.data;
  },

  // Delete dish
  delete: async (id) => {
    const response = await axiosClient.delete(`/dishes/${id}`);
    return response.data;
  },

  // Search dishes by title
  search: async (searchTerm) => {
    const response = await axiosClient.get(
      `/dishes/search?q=${encodeURIComponent(searchTerm)}`,
    );
    return response.data;
  },

  // Get dishes by dietary tags (requires exact match of all tags)
  getByTags: async (tags) => {
    const response = await axiosClient.post("/dishes/tags", { tags });
    return response.data;
  },
};
