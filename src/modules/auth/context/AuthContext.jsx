// src/modules/auth/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../../../api/endpoints/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = storage.getAuth();
    if (stored) {
      setUser(stored.user);
      //   console.log(JSON.stringify(stored, null, 2));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    storage.setAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    window.location.href = "/#/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
