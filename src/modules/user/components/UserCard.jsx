// src/modules/user/components/UserCard.jsx
import React from "react";
import { Card, Badge, Button } from "../../../components/shared";
import {
  Phone,
  Mail,
  MapPin,
  Eye,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";

const UserCard = ({ user, onEdit }) => {
  const statusColors = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
    suspended: "secondary",
  };

  return (
    <Card className="group border-none ring-1 ring-slate-200 hover:ring-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden bg-white">
      {/* Top Banner */}
      <div className="h-1.5 w-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <UserIcon size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                {user.fullName}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                Member since {new Date(user.createdAt).getFullYear()}
              </p>
            </div>
          </div>
          <Badge
            variant={statusColors[user.accountStatus]}
            className="rounded-lg shadow-sm"
          >
            {user.accountStatus}
          </Badge>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Phone size={14} className="text-slate-300" />
            <span className="font-semibold">{user.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Mail size={14} className="text-slate-300" />
            <span className="truncate font-semibold">
              {user.email || "No email"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <MapPin size={14} className="text-slate-300" />
            <span className="truncate font-semibold">
              {user.address?.area || "Location not set"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onEdit(user)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all active:scale-95"
          >
            Manage <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onEdit(user)} // Opens the same modal
            className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
