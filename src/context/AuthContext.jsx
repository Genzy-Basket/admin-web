import { createContext, useContext, useState, useEffect } from "react";
import { getStoredAuth, setStoredAuth, adminLogout } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setStoredAuth(authToken, userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    adminLogout();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
