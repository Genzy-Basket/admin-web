import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Shield,
  Mail,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Replace with your actual endpoint
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const statusToast = toast.loading("Updating user status...");
    try {
      await axios.patch(`http://localhost:3000/api/users/${userId}/status`);

      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
      toast.success("User status updated", { id: statusToast });
    } catch (err) {
      console.log(err);

      toast.error("Failed to update status", { id: statusToast });
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-bold">
        Loading User Directory...
      </div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              User Management
            </h1>
            <p className="text-slate-500 text-sm">
              Control access levels and account security
            </p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200">
            <UserPlus size={18} />
            Add New User
          </button>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Profile & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{user.name}</p>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield
                        size={14}
                        className={
                          user.role === "admin"
                            ? "text-amber-500"
                            : "text-slate-400"
                        }
                      />
                      <span
                        className={`text-xs font-bold uppercase ${
                          user.role === "admin"
                            ? "text-amber-600"
                            : "text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={`flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {user.isActive ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {user.isActive ? "Active" : "Suspended"}
                    </button>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.lastLogin || "Never"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
