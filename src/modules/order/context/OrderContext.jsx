import { createContext, useContext, useState, useCallback } from "react";
import { orderApi } from "../../../api/endpoints/order.api";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (params = {}, force = false) => {
    if (!force && orders.length > 0 && Object.keys(params).length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getAll(params);
      setOrders(res.orders || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [orders.length]);

  const fetchStats = useCallback(async (force = false) => {
    if (!force && stats !== null) return;
    try {
      const res = await orderApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch order stats", err);
    }
  }, [stats]);

  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getById(orderId);
      setCurrentOrder(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (orderId, status, adminNotes) => {
      try {
        const res = await orderApi.updateStatus(orderId, status, adminNotes);
        const updated = res.data;
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? updated : o)),
        );
        if (currentOrder?.orderId === orderId) setCurrentOrder(updated);
        return { success: true, data: updated };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to update status",
        };
      }
    },
    [currentOrder],
  );

  const cancelOrder = useCallback(
    async (orderId, reason, adminNotes) => {
      try {
        const res = await orderApi.cancel(orderId, reason, adminNotes);
        const updated = res.data;
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? updated : o)),
        );
        if (currentOrder?.orderId === orderId) setCurrentOrder(updated);
        return { success: true, data: updated };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Failed to cancel order",
        };
      }
    },
    [currentOrder],
  );

  const bulkOutForDelivery = useCallback(async () => {
    try {
      const res = await orderApi.bulkOutForDelivery();
      // Refresh the list so the UI reflects updated statuses
      await fetchOrders({}, true);
      return { success: true, modifiedCount: res.modifiedCount, message: res.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Bulk update failed",
      };
    }
  }, [fetchOrders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        stats,
        pagination,
        loading,
        error,
        fetchOrders,
        fetchStats,
        fetchOrder,
        updateStatus,
        cancelOrder,
        bulkOutForDelivery,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
