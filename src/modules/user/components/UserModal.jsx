import { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle,
  Ban,
  RefreshCw,
} from "lucide-react";
import { Modal, Button, FormTextarea, Badge } from "../../../components/shared";
import { useUsers } from "../context/UserContext";

const UserModal = ({ user, isOpen, onClose }) => {
  const { approveUser, rejectUser, suspendUser, reactivateUser } = useUsers();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const fullAddress = user.address
    ? `${user.address.houseOrFlat}, ${user.address.street}, ${user.address.area}, ${user.address.pincode}`
    : "No address provided";

  const performAction = async (actionFn) => {
    setSubmitting(true);
    try {
      await actionFn(user._id, reason);
      setReason("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Custom header inside body for avatar layout */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <span className="text-xl font-black">{user.fullName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 truncate">
              {user.fullName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge
                variant={
                  user.accountStatus === "approved"
                    ? "success"
                    : user.accountStatus === "suspended"
                    ? "danger"
                    : "warning"
                }
              >
                {user.accountStatus}
              </Badge>
              <span className="text-xs text-slate-400 font-bold self-center">
                #{user._id.slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Clock size={12} />
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
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Calendar size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Joined
            </span>
          </div>
          <p className="text-sm font-bold text-slate-700">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100 mb-5">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
          <MapPin size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">
            Service Address
          </p>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            {fullAddress}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Administrative Actions
        </p>

        {(user.accountStatus === "pending" ||
          user.accountStatus === "approved") && (
          <FormTextarea
            placeholder="Note the reason for this status change..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-slate-50 border-none ring-1 ring-slate-200"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          {user.accountStatus === "pending" && (
            <>
              <Button
                variant="success"
                className="py-3 rounded-xl font-bold gap-2"
                onClick={() => performAction(approveUser)}
                disabled={submitting}
              >
                <CheckCircle size={16} /> Approve
              </Button>
              <Button
                variant="danger"
                className="py-3 rounded-xl font-bold gap-2"
                onClick={() => performAction(rejectUser)}
                disabled={submitting}
              >
                <ShieldAlert size={16} /> Reject
              </Button>
            </>
          )}

          {user.accountStatus === "approved" && (
            <Button
              variant="warning"
              className="col-span-2 py-3 rounded-xl font-bold gap-2"
              onClick={() => performAction(suspendUser)}
              disabled={submitting}
            >
              <Ban size={16} /> Suspend Account
            </Button>
          )}

          {user.accountStatus === "suspended" && (
            <Button
              variant="success"
              className="col-span-2 py-3 rounded-xl font-bold gap-2"
              onClick={() => performAction(reactivateUser)}
              disabled={submitting}
            >
              <RefreshCw size={16} /> Reactivate User
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;
