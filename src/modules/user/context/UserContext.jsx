import { createContext, useContext, useState, useCallback } from "react";
import { userApi } from "../../../api/endpoints/user.api";
import { errorBus } from "../../../api/errorBus";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);

  const fetchUsers = useCallback(
    async (filters = {}, force = false) => {
      if (!force && users.length > 0) return;

      setLoading(true);
      try {
        const res = await userApi.getAll(filters);
        setUsers(res.data);
        setPagination(res.pagination);
      } catch (err) {
        errorBus.emit(err.message || "Failed to fetch users", "error");
      } finally {
        setLoading(false);
      }
    },
    [users.length],
  );

  const fetchStats = async () => {
    try {
      const res = await userApi.getStats();
      setStats(res.data);
    } catch (err) {
      errorBus.emit(err.message || "Failed to fetch user stats", "error");
    }
  };

  const fetchUserById = useCallback(async (userId) => {
    const cached = users.find((u) => u._id === userId);
    if (cached) return cached;
    try {
      const res = await userApi.getById(userId);
      return res.data;
    } catch (err) {
      errorBus.emit(err.message || "Failed to fetch user", "error");
      return null;
    }
  }, [users]);

  const handleAction = async (actionFn, ...args) => {
    const res = await actionFn(...args);
    setUsers((prev) =>
      prev.map((u) => (u._id === res.data._id ? res.data : u)),
    );
    return res;
  };

  const value = {
    users,
    loading,
    pagination,
    stats,
    fetchUsers,
    fetchStats,
    fetchUserById,
    approveUser: (id) => handleAction(userApi.approve, id),
    rejectUser: (id, reason) => handleAction(userApi.reject, id, reason),
    suspendUser: (id, reason) => handleAction(userApi.suspend, id, reason),
    reactivateUser: (id) => handleAction(userApi.reactivate, id),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => useContext(UserContext);
