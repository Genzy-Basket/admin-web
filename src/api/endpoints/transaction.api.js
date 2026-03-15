import axiosClient from "../axiosClient";

export const transactionApi = {
  /** Summary stats — wallet totals + payment method breakdown */
  getStats: async () => {
    const res = await axiosClient.get("/admin/transactions/stats");
    return res.data;
  },

  /** Wallet transactions — paginated with filters */
  getWalletTransactions: async (params = {}) => {
    const res = await axiosClient.get("/admin/transactions/wallet", { params });
    return res.data;
  },

  /** Order payments — paginated with filters */
  getOrderPayments: async (params = {}) => {
    const res = await axiosClient.get("/admin/transactions/payments", { params });
    return res.data;
  },

  /** Subscription payments — paginated with filters */
  getSubscriptionPayments: async (params = {}) => {
    const res = await axiosClient.get("/admin/transactions/subscriptions", { params });
    return res.data;
  },
};
