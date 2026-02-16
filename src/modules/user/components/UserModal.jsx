import React, { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle,
  Ban,
  RefreshCw,
} from "lucide-react";
import { Button, FormTextarea, Badge } from "../../../components/shared";
import { useUsers } from "../context/UserContext";

const UserModal = ({ user, isOpen, onClose }) => {
  const { approveUser, rejectUser, suspendUser, reactivateUser } = useUsers();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user || !isOpen) return null;

  // Helper to format the nested address object
  const fullAddress = user.address
    ? `${user.address.houseOrFlat}, ${user.address.street}, ${user.address.area}, ${user.address.pincode}`
    : "No address provided";

  const performAction = async (actionFn) => {
    setSubmitting(true);
    try {
      await actionFn(user._id, reason);
      setReason(""); // Clear reason on success
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center text-indigo-600">
              <span className="text-xl font-black">
                {user.fullName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {user.fullName}
              </h2>
              <div className="flex gap-2 mt-1">
                <Badge
                  variant={
                    user.accountStatus === "approved" ? "success" : "warning"
                  }
                >
                  {user.accountStatus}
                </Badge>
                <span className="text-xs text-slate-400 font-bold self-center">
                  ID: {user._id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Insights Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Last Login
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Joined
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Address Block */}
          <div className="flex gap-4 items-start p-4 ring-1 ring-slate-100 rounded-2xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase mb-1">
                Service Address
              </h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {fullAddress}
              </p>
            </div>
          </div>

          {/* Action Center */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
              Administrative Actions
            </h4>

            {(user.accountStatus === "pending" ||
              user.accountStatus === "approved") && (
              <div className="animate-in slide-in-from-bottom-2">
                <FormTextarea
                  placeholder="Note the reason for this status change..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-slate-50 border-none ring-1 ring-slate-200"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {user.accountStatus === "pending" && (
                <>
                  <Button
                    variant="success"
                    className="py-4 rounded-2xl font-bold gap-2"
                    onClick={() => performAction(approveUser)}
                    disabled={submitting}
                  >
                    <CheckCircle size={18} /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    className="py-4 rounded-2xl font-bold gap-2"
                    onClick={() => performAction(rejectUser)}
                    disabled={submitting}
                  >
                    <ShieldAlert size={18} /> Reject
                  </Button>
                </>
              )}

              {user.accountStatus === "approved" && (
                <Button
                  variant="warning"
                  className="col-span-2 py-4 rounded-2xl font-bold gap-2"
                  onClick={() => performAction(suspendUser)}
                  disabled={submitting}
                >
                  <Ban size={18} /> Suspend Account
                </Button>
              )}

              {user.accountStatus === "suspended" && (
                <Button
                  variant="success"
                  className="col-span-2 py-4 rounded-2xl font-bold gap-2"
                  onClick={() => performAction(reactivateUser)}
                  disabled={submitting}
                >
                  <RefreshCw size={18} /> Reactivate User
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
