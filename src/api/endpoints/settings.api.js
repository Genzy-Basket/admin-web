import axiosClient from "../axiosClient";

export const settingsApi = {
  get: async () => {
    const response = await axiosClient.get("/settings");
    return response.data;
  },

  update: async (data) => {
    const response = await axiosClient.patch("/settings", data);
    return response.data;
  },
};
