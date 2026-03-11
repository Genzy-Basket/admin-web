import axiosClient from "../axiosClient";

export const notificationApi = {
  broadcast: async (title, body) => {
    const response = await axiosClient.post("/admin/notifications/broadcast", { title, body });
    return response.data;
  },

  sendToUser: async (userId, title, body) => {
    const response = await axiosClient.post("/admin/notifications/send", { userId, title, body });
    return response.data;
  },
};
