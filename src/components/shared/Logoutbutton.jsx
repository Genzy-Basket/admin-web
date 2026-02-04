import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-4">
      {user && (
        <span className="text-sm text-gray-600">Welcome, {user.fullName}</span>
      )}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
