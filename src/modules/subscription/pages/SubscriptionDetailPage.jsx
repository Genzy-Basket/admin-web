import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageMeta } from "../../../context/PageHeaderContext";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import { Badge, Modal } from "../../../components/shared";

// ── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: "Active",    variant: "success"   },
  paused:    { label: "Paused",    variant: "warning"   },
  cancelled: { label: "Cancelled", variant: "danger"    },
  completed: { label: "Completed", variant: "secondary" },
};

const DELIVERY_STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  variant: "info"      },
  delivered: { label: "Delivered", variant: "success"   },
  skipped:   { label: "Skipped",   variant: "warning"   },
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtShortDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// ── Small helpers ────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider w-32 shrink-0">
      {label}
    </span>
    <span className="text-sm text-slate-700 font-medium text-right">
      {value ?? "—"}
    </span>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const SubscriptionDetailPage = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const {
    fetchSubscription,
    markDelivered,
    cancelSubscription,
    loading,
    error,
  } = useSubscriptions();

  const [sub, setSub] = useState(null);
  const [delivering, setDelivering] = useState(null); // date string being marked
  const [deliverConfirmDate, setDeliverConfirmDate] = useState(null); // date awaiting confirmation

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  usePageMeta({
    title: sub ? `Sub #${sub.subscriptionId}` : "Subscription Details",
  });

  useEffect(() => {
    if (!subscriptionId) return;
    fetchSubscription(subscriptionId).then((s) => {
      if (s) setSub(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId]);

  const handleConfirmDelivery = async () => {
    if (!deliverConfirmDate) return;
    setDelivering(deliverConfirmDate);
    setDeliverConfirmDate(null);
    const result = await markDelivered(sub._id, deliverConfirmDate);
    if (result.success) setSub(result.data);
    setDelivering(null);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Cancellation reason is required");
      return;
    }
    setCancelling(true);
    setCancelError("");
    const result = await cancelSubscription(sub._id, cancelReason.trim());
    setCancelling(false);
    if (result.success) {
      setSub(result.data);
      setShowCancelModal(false);
      setCancelReason("");
    } else {
      setCancelError(result.message);
    }
  };

  if (loading && !sub) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#099E0E] animate-spin" />
      </div>
    );
  }

  if (error && !sub) {
    return (
      <div className="text-center py-32">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!sub) return null;

  const delivered = sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
  const skipped = sub.deliveryDates?.filter((d) => d.status === "skipped").length ?? 0;
  const total = sub.totalDays ?? 0;
  const progress = total > 0 ? Math.round(((delivered + skipped) / total) * 100) : 0;

  return (
    <>
      {/* Back nav */}
      <button
        onClick={() => navigate("/subscriptions")}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Subscriptions
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              #{sub.subscriptionId}
            </h1>
            <Badge
              variant={STATUS_CONFIG[sub.status]?.variant || "secondary"}
              size="sm"
            >
              {STATUS_CONFIG[sub.status]?.label || sub.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Created {fmtDate(sub.createdAt)}
          </p>
        </div>

        {(sub.status === "active" || sub.status === "paused") && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all"
          >
            <XCircle className="w-4 h-4" />
            Cancel Subscription
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <Section title="Items" icon={Package}>
            <div className="space-y-3">
              {sub.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.productSnapshot?.imageUrl ? (
                    <img
                      src={item.productSnapshot.imageUrl}
                      alt={item.productSnapshot.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.productSnapshot?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.displayLabel} × {item.quantity} — ₹{item.unitPrice} each
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Delivery Schedule */}
          <Section title="Delivery Schedule" icon={Calendar}>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{delivered} delivered, {skipped} skipped / {total} days</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#099E0E] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Date list */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {sub.deliveryDates?.map((dd, i) => {
                const dateStr = new Date(dd.date).toISOString().split("T")[0];
                const isUpcoming = dd.status === "upcoming";

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          dd.status === "delivered"
                            ? "bg-emerald-500"
                            : dd.status === "skipped"
                              ? "bg-amber-500"
                              : "bg-sky-500"
                        }`}
                      />
                      <span className="text-sm text-slate-700 font-medium">
                        {fmtShortDate(dd.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          DELIVERY_STATUS_CONFIG[dd.status]?.variant || "secondary"
                        }
                        size="xs"
                      >
                        {DELIVERY_STATUS_CONFIG[dd.status]?.label || dd.status}
                      </Badge>
                      {isUpcoming &&
                        sub.status === "active" && (
                          <button
                            onClick={() => setDeliverConfirmDate(dateStr)}
                            disabled={delivering === dateStr}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#099E0E] text-white text-xs font-bold rounded-lg hover:bg-[#078A0C] disabled:opacity-50 transition-all"
                          >
                            {delivering === dateStr ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Deliver
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Customer" icon={User}>
            <InfoRow label="Name" value={sub.userId?.fullName} />
            <InfoRow label="Phone" value={sub.userId?.phoneNumber} />
            <InfoRow label="Email" value={sub.userId?.email} />
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={CreditCard}>
            <InfoRow label="Method" value={sub.paymentMethod} />
            <InfoRow label="Status" value={sub.paymentStatus} />
            <InfoRow label="Daily Cost" value={`₹${sub.dailyCost}`} />
            <InfoRow label="Total" value={`₹${sub.totalAmount}`} />
            <InfoRow label="Refunded" value={`₹${sub.refundedAmount ?? 0}`} />
            {sub.paidAt && <InfoRow label="Paid At" value={fmtDate(sub.paidAt)} />}
          </Section>

          {/* Timeline */}
          <Section title="Timeline" icon={Calendar}>
            <InfoRow label="Created" value={fmtDate(sub.createdAt)} />
            {sub.pausedAt && (
              <InfoRow label="Paused" value={fmtDate(sub.pausedAt)} />
            )}
            {sub.cancelledAt && (
              <InfoRow label="Cancelled" value={fmtDate(sub.cancelledAt)} />
            )}
            {sub.completedAt && (
              <InfoRow label="Completed" value={fmtDate(sub.completedAt)} />
            )}
            {sub.cancellationReason && (
              <InfoRow label="Cancel Reason" value={sub.cancellationReason} />
            )}
          </Section>

          {/* Cost Breakdown */}
          <Section title="Cost Breakdown" icon={IndianRupee}>
            <InfoRow label="Daily Cost" value={`₹${sub.dailyCost}`} />
            <InfoRow label="Total Days" value={sub.totalDays} />
            <InfoRow
              label="Total Amount"
              value={`₹${sub.totalAmount?.toLocaleString("en-IN")}`}
            />
            <InfoRow
              label="Refunded"
              value={`₹${(sub.refundedAmount ?? 0).toLocaleString("en-IN")}`}
            />
            <InfoRow
              label="Net Amount"
              value={`₹${((sub.totalAmount ?? 0) - (sub.refundedAmount ?? 0)).toLocaleString("en-IN")}`}
            />
          </Section>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
          setCancelError("");
        }}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will cancel the subscription and refund remaining days to the
            user's wallet. This action cannot be undone.
          </p>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              placeholder="Why is this subscription being cancelled?"
            />
          </div>
          {cancelError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {cancelError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
                setCancelError("");
              }}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
            >
              Keep Active
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancel Subscription
            </button>
          </div>
        </div>
      </Modal>

      {/* Deliver Confirmation Modal */}
      <Modal
        isOpen={!!deliverConfirmDate}
        onClose={() => setDeliverConfirmDate(null)}
        title="Confirm Delivery"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Mark delivery for <span className="font-bold text-slate-800">{fmtShortDate(deliverConfirmDate)}</span> as delivered?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeliverConfirmDate(null)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelivery}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#099E0E] rounded-xl hover:bg-[#078A0C] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Delivered
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubscriptionDetailPage;
