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
    const response = await axiosClient.patch(`/ingredient/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`/ingredient/${id}`);
    return response.data;
  },

  toggleVisibility: async (id, isHidden) => {
    const response = await axiosClient.patch(`/ingredient/${id}`, {
      isHidden,
    });
    return response.data;
  },
};

/**
 * Media Related API (Cloudinary Signature)
 */
export const getCloudinarySignature = async (folder) => {
  const response = await axiosClient.get(`/media-upload-signature/${folder}`);
  return response.data;
};
