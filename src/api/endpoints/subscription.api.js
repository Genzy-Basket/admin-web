import axiosClient from "../axiosClient";

export const subscriptionApi = {
  /** Stats — count by status, revenue, refunds */
  getStats: async () => {
    const res = await axiosClient.get("/admin/subscriptions/stats");
    return res.data;
  },

  /** Paginated list with optional filters */
  getAll: async (params = {}) => {
    const res = await axiosClient.get("/admin/subscriptions", { params });
    return res.data;
  },

  /** Single subscription detail */
  getById: async (subscriptionId) => {
    const res = await axiosClient.get(`/admin/subscriptions/${subscriptionId}`);
    return res.data;
  },

  /** Mark a specific delivery date as packed */
  markPacked: async (subscriptionId, date) => {
    const res = await axiosClient.post(
      `/admin/subscriptions/${subscriptionId}/pack`,
      { date },
    );
    return res.data;
  },

  /** Mark a specific delivery date as delivered */
  markDelivered: async (subscriptionId, date) => {
    const res = await axiosClient.post(
      `/admin/subscriptions/${subscriptionId}/deliver`,
      { date },
    );
    return res.data;
  },

  /** Bulk mark a date's deliveries as delivered */
  bulkMarkDelivered: async (date) => {
    const res = await axiosClient.post("/admin/subscriptions/bulk-deliver", { date });
    return res.data;
  },

  /** Admin cancel subscription */
  cancel: async (subscriptionId, reason) => {
    const res = await axiosClient.post(
      `/admin/subscriptions/${subscriptionId}/cancel`,
      { reason },
    );
    return res.data;
  },
};
