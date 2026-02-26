import axiosClient from "../axiosClient";

export const orderApi = {
  /** Dashboard stats — byStatus counts, today's revenue, all-time revenue */
  getStats: async (params = {}) => {
    const res = await axiosClient.get("/admin/orders/stats", { params });
    return res.data; // { success, data: { byStatus, today, allTime } }
  },

  /** Paginated list with optional filters */
  getAll: async (params = {}) => {
    const res = await axiosClient.get("/admin/orders", { params });
    return res.data; // { success, orders, pagination }
  },

  /** Full detail of a single order */
  getById: async (orderId) => {
    const res = await axiosClient.get(`/admin/orders/${orderId}`);
    return res.data; // { success, data: order }
  },

  /**
   * Update order status
   * @param {string} status  "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled"
   */
  updateStatus: async (orderId, status, adminNotes = null) => {
    const res = await axiosClient.patch(`/admin/orders/${orderId}/status`, {
      status,
      adminNotes,
    });
    return res.data; // { success, data: order }
  },

  /** Admin cancel — triggers refund for paid online orders */
  cancel: async (orderId, reason, adminNotes = null) => {
    const res = await axiosClient.post(`/admin/orders/${orderId}/cancel`, {
      reason,
      adminNotes,
    });
    return res.data; // { success, data: order }
  },

  /** Mark all confirmed/processing orders as out_for_delivery in one shot */
  bulkOutForDelivery: async () => {
    const res = await axiosClient.post("/admin/orders/bulk-out-for-delivery");
    return res.data; // { success, message, modifiedCount, deliveryConfig }
  },
};
