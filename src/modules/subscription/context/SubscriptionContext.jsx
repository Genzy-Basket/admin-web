import { createContext, useContext, useState, useCallback } from "react";
import { subscriptionApi } from "../../../api/endpoints/subscription.api";
import { errorBus } from "../../../api/errorBus";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getAll(params);
      setSubscriptions(res.subscriptions || []);
      setPagination(res.pagination || null);
    } catch (err) {
      const message = err.message || "Failed to fetch subscriptions";
      setError(message);
      errorBus.emit(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await subscriptionApi.getStats();
      setStats(res.data);
    } catch (err) {
      errorBus.emit(
        err.message || "Failed to fetch subscription stats",
        "error",
      );
    }
  }, []);

  const fetchSubscription = useCallback(async (subscriptionId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionApi.getById(subscriptionId);
      setCurrentSubscription(res.data);
      return res.data;
    } catch (err) {
      const message = err.message || "Subscription not found";
      setError(message);
      errorBus.emit(message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markDelivered = useCallback(
    async (subscriptionId, date) => {
      try {
        const res = await subscriptionApi.markDelivered(subscriptionId, date);
        const updated = res.data;
        setSubscriptions((prev) =>
          prev.map((s) =>
            s._id === updated._id || s.subscriptionId === updated.subscriptionId
              ? updated
              : s,
          ),
        );
        if (
          currentSubscription &&
          (currentSubscription._id === updated._id ||
            currentSubscription.subscriptionId === updated.subscriptionId)
        ) {
          setCurrentSubscription(updated);
        }
        errorBus.emit("Delivery marked as delivered", "success");
        return { success: true, data: updated };
      } catch (err) {
        const message = err.message || "Failed to mark delivered";
        errorBus.emit(message, "error");
        return { success: false, message };
      }
    },
    [currentSubscription],
  );

  const bulkMarkDelivered = useCallback(async () => {
    try {
      const res = await subscriptionApi.bulkMarkDelivered();
      await fetchSubscriptions({});
      errorBus.emit(res.message || "Bulk delivery update successful", "success");
      return { success: true, ...res };
    } catch (err) {
      const message = err.message || "Bulk delivery update failed";
      errorBus.emit(message, "error");
      return { success: false, message };
    }
  }, [fetchSubscriptions]);

  const cancelSubscription = useCallback(
    async (subscriptionId, reason) => {
      try {
        const res = await subscriptionApi.cancel(subscriptionId, reason);
        const updated = res.data;
        setSubscriptions((prev) =>
          prev.map((s) =>
            s._id === updated._id || s.subscriptionId === updated.subscriptionId
              ? updated
              : s,
          ),
        );
        if (
          currentSubscription &&
          (currentSubscription._id === updated._id ||
            currentSubscription.subscriptionId === updated.subscriptionId)
        ) {
          setCurrentSubscription(updated);
        }
        errorBus.emit("Subscription cancelled", "success");
        return { success: true, data: updated };
      } catch (err) {
        const message = err.message || "Failed to cancel subscription";
        errorBus.emit(message, "error");
        return { success: false, message };
      }
    },
    [currentSubscription],
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        currentSubscription,
        stats,
        pagination,
        loading,
        error,
        fetchSubscriptions,
        fetchStats,
        fetchSubscription,
        markDelivered,
        bulkMarkDelivered,
        cancelSubscription,
        setCurrentSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => useContext(SubscriptionContext);
