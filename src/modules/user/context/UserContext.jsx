import React, { createContext, useContext, useState, useCallback } from "react";
import { userApi } from "../../../api/endpoints/user.api";

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
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    },
    [users.length],
  );

  const fetchStats = async () => {
    const res = await userApi.getStats();
    setStats(res.data);
  };

  const handleAction = async (actionFn, ...args) => {
    try {
      const res = await actionFn(...args);
      // Optimistically update or just refresh list
      setUsers((prev) =>
        prev.map((u) => (u._id === res.data._id ? res.data : u)),
      );
      return res;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    users,
    loading,
    pagination,
    stats,
    fetchUsers,
    fetchStats,
    approveUser: (id) => handleAction(userApi.approve, id),
    rejectUser: (id, reason) => handleAction(userApi.reject, id, reason),
    suspendUser: (id, reason) => handleAction(userApi.suspend, id, reason),
    reactivateUser: (id) => handleAction(userApi.reactivate, id),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsers = () => useContext(UserContext);
