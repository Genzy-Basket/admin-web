import { createContext, useContext, useState, useCallback } from "react";
import { orderApi } from "../../../api/endpoints/order.api";
import { errorBus } from "../../../api/errorBus";

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
      const message = err.message || "Failed to fetch orders";
      setError(message);
      errorBus.emit(message, "error");
    } finally {
      setLoading(false);
    }
  }, [orders.length]);

  const fetchStats = useCallback(async (params = {}) => {
    try {
      const res = await orderApi.getStats(params);
      setStats(res.data);
    } catch (err) {
      errorBus.emit(err.message || "Failed to fetch order stats", "error");
    }
  }, []);

  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getById(orderId);
      setCurrentOrder(res.data);
      return res.data;
    } catch (err) {
      const message = err.message || "Order not found";
      setError(message);
      errorBus.emit(message, "error");
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
        errorBus.emit("Order status updated", "success");
        return { success: true, data: updated };
      } catch (err) {
        const message = err.message || "Failed to update status";
        errorBus.emit(message, "error");
        return { success: false, message };
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
        errorBus.emit("Order cancelled", "success");
        return { success: true, data: updated };
      } catch (err) {
        const message = err.message || "Failed to cancel order";
        errorBus.emit(message, "error");
        return { success: false, message };
      }
    },
    [currentOrder],
  );

  const bulkOutForDelivery = useCallback(async () => {
    try {
      const res = await orderApi.bulkOutForDelivery();
      await fetchOrders({}, true);
      errorBus.emit(res.message || "Bulk update successful", "success");
      return { success: true, modifiedCount: res.modifiedCount, message: res.message };
    } catch (err) {
      const message = err.message || "Bulk update failed";
      errorBus.emit(message, "error");
      return { success: false, message };
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
