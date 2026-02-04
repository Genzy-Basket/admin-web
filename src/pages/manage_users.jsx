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
          u._id === userId ? { ...u, isActive: !currentStatus } : u,
        ),
      );
      toast.success("User status updated", { id: statusToast });
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status", { id: statusToast });
    }
  };

  if (loading)
    return (
      <div className="p-6 sm:p-10 text-center animate-pulse font-bold">
        Loading User Directory...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">
              User Management
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Control access levels and account security
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 text-sm sm:text-base">
            <UserPlus size={18} />
            <span className="hidden sm:inline">Add New User</span>
            <span className="sm:hidden">Add User</span>
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              {/* User Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <Mail size={12} />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Role */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Role
                  </p>
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
                </div>

                {/* Status */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Status
                  </p>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
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
                </div>
              </div>

              {/* Last Login */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Last Login
                </p>
                <p className="text-sm text-slate-600">
                  {user.lastLogin || "Never"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Edit size={18} />
                  <span className="text-sm font-semibold">Edit</span>
                </button>
                <button className="flex-1 p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  <span className="text-sm font-semibold">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
