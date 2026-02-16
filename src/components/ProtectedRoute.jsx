// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading Auth...</div>;

  if (!isAuthenticated) {
    // Note: We use /login here, but because of basename="/admin",
    // it will actually point to /admin/login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
