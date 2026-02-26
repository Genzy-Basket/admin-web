import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageMeta } from "../../../context/PageHeaderContext";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { Badge, Modal } from "../../../components/shared";

// ── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:          { label: "Pending",          variant: "warning"   },
  confirmed:        { label: "Confirmed",         variant: "info"      },
  processing:       { label: "Processing",        variant: "primary"   },
  out_for_delivery: { label: "Out for Delivery",  variant: "warning"   },
  delivered:        { label: "Delivered",         variant: "success"   },
  cancelled:        { label: "Cancelled",         variant: "danger"    },
  refunded:         { label: "Refunded",          variant: "secondary" },
};

const PAYMENT_STATUS_CONFIG = {
  pending:    { label: "Pending",    variant: "warning"   },
  processing: { label: "Processing", variant: "info"      },
  success:    { label: "Paid",       variant: "success"   },
  failed:     { label: "Failed",     variant: "danger"    },
  refunded:   { label: "Refunded",   variant: "secondary" },
};

// Statuses admin can set via the dropdown (not cancelled — that uses the cancel modal)
const UPDATABLE_STATUSES = [
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
];

// ── Small helpers ─────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider w-32 shrink-0">
      {label}
    </span>
    <span className="text-sm text-slate-700 font-medium text-right">{value ?? "—"}</span>
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

// ── Page ──────────────────────────────────────────────────────────────────────
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchOrder, updateStatus, cancelOrder, loading, error } = useOrders();

  const [order, setOrder] = useState(null);
  const [statusValue, setStatusValue] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Dynamic header title — updates once the order finishes loading
  usePageMeta({
    title: order ? `Order #${order.orderId}` : "Order Details",
  });
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelAdminNotes, setCancelAdminNotes] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then((o) => {
      if (o) {
        setOrder(o);
        setStatusValue(o.orderStatus);
        setAdminNotes(o.adminNotes || "");
      }
    });
  }, [orderId, fetchOrder]);

  // ── Update status ──────────────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!statusValue || statusValue === order.orderStatus) {
      setStatusError("Please select a different status.");
      return;
    }
    setSaving(true);
    setStatusError("");
    setStatusSuccess("");
    const result = await updateStatus(order.orderId, statusValue, adminNotes || null);
    setSaving(false);
    if (result.success) {
      setOrder(result.data);
      setStatusSuccess("Status updated successfully.");
      setTimeout(() => setStatusSuccess(""), 3000);
    } else {
      setStatusError(result.message);
    }
  };

  // ── Cancel order ───────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError("Cancellation reason is required.");
      return;
    }
    setCancelling(true);
    setCancelError("");
    const result = await cancelOrder(
      order.orderId,
      cancelReason.trim(),
      cancelAdminNotes || null,
    );
    setCancelling(false);
    if (result.success) {
      setOrder(result.data);
      setShowCancelModal(false);
      setCancelReason("");
      setCancelAdminNotes("");
    } else {
      setCancelError(result.message);
    }
  };

  const isFinal = ["delivered", "cancelled", "refunded"].includes(
    order?.orderStatus,
  );

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading && !order) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!order && error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl border border-red-100 p-10 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="font-bold text-slate-700">{error}</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-900">
            Order{" "}
            <span className="font-mono text-indigo-600">#{order.orderId}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge
          variant={STATUS_CONFIG[order.orderStatus]?.variant || "secondary"}
          size="md"
        >
          {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <Section title="Order Items" icon={Package}>
            <ul className="divide-y divide-slate-50">
              {order.items.map((item) => {
                const name =
                  item.productSnapshot?.name ||
                  item.productId?.name ||
                  "Product";
                const image =
                  item.productSnapshot?.imageUrl || item.productId?.imageUrl;
                return (
                  <li key={item._id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.value} {item.unit} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-800">
                        ₹{item.totalPrice?.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        ₹{item.unitPrice} each
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pricing breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <PriceRow label="Subtotal (MRP)" value={`₹${order.mrpTotal?.toFixed(2)}`} muted />
              {order.savings > 0 && (
                <PriceRow
                  label="Discount"
                  value={`−₹${order.savings?.toFixed(2)}`}
                  accent
                />
              )}
              <PriceRow
                label="Delivery"
                value={order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}
              />
              {order.tax > 0 && (
                <PriceRow label="Tax" value={`₹${order.tax?.toFixed(2)}`} />
              )}
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="text-sm font-bold text-slate-800">Total</span>
                <span className="text-base font-black text-slate-900">
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </Section>

          {/* Delivery address */}
          {order.deliveryAddress && (
            <Section title="Delivery Address" icon={MapPin}>
              <p className="text-sm text-slate-700">
                {order.deliveryAddress.houseOrFlat},{" "}
                {order.deliveryAddress.street}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {order.deliveryAddress.area},{" "}
                {order.deliveryAddress.pincode}
              </p>
            </Section>
          )}
        </div>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Customer */}
          <Section title="Customer" icon={User}>
            <InfoRow label="Name"  value={order.userId?.fullName} />
            <InfoRow label="Phone" value={order.userId?.phoneNumber} />
            <InfoRow label="Email" value={order.userId?.email} />
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={CreditCard}>
            <div className="space-y-1">
              <InfoRow label="Method"  value={order.payment?.method?.toUpperCase()} />
              <InfoRow
                label="Status"
                value={
                  <Badge
                    variant={
                      PAYMENT_STATUS_CONFIG[order.payment?.status]?.variant ||
                      "secondary"
                    }
                    size="xs"
                  >
                    {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label ||
                      order.payment?.status}
                  </Badge>
                }
              />
              <InfoRow label="Amount" value={`₹${order.payment?.amount?.toFixed(2)}`} />
              {order.payment?.transactionId && (
                <InfoRow label="Txn ID" value={<span className="font-mono text-xs">{order.payment.transactionId}</span>} />
              )}
              {order.payment?.paidAt && (
                <InfoRow
                  label="Paid At"
                  value={new Date(order.payment.paidAt).toLocaleString("en-IN")}
                />
              )}
              {order.payment?.failureReason && (
                <InfoRow label="Failure" value={order.payment.failureReason} />
              )}
            </div>
          </Section>

          {/* Timestamps */}
          <Section title="Timeline">
            {order.confirmedAt && (
              <InfoRow label="Confirmed" value={fmt(order.confirmedAt)} />
            )}
            {order.processingAt && (
              <InfoRow label="Processing" value={fmt(order.processingAt)} />
            )}
            {order.outForDeliveryAt && (
              <InfoRow label="Out for Del." value={fmt(order.outForDeliveryAt)} />
            )}
            {order.deliveredAt && (
              <InfoRow label="Delivered" value={fmt(order.deliveredAt)} />
            )}
            {order.cancelledAt && (
              <InfoRow label="Cancelled" value={fmt(order.cancelledAt)} />
            )}
            {order.expectedDeliveryDate && !order.deliveredAt && (
              <InfoRow
                label="Expected"
                value={new Date(order.expectedDeliveryDate).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short" },
                )}
              />
            )}
          </Section>

          {/* Cancellation info */}
          {(order.cancellationReason || order.adminNotes) && (
            <Section title="Notes">
              {order.cancellationReason && (
                <InfoRow label="Reason" value={order.cancellationReason} />
              )}
              {order.cancelledBy && (
                <InfoRow label="Cancelled By" value={order.cancelledBy} />
              )}
              {order.adminNotes && (
                <InfoRow label="Admin Notes" value={order.adminNotes} />
              )}
            </Section>
          )}

          {/* ── Status Update ─────────────────────────────────────────── */}
          {!isFinal && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                Update Status
              </h3>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
              >
                {UPDATABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                placeholder="Admin notes (optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
              />
              {statusError && (
                <p className="text-xs text-red-500 font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {statusError}
                </p>
              )}
              {statusSuccess && (
                <p className="text-xs text-emerald-600 font-medium mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {statusSuccess}
                </p>
              )}
              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Status
              </button>

              {/* Cancel order button */}
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full mt-2 py-2.5 border-2 border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Cancel Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
          setCancelAdminNotes("");
          setCancelError("");
        }}
        title="Cancel Order"
        size="md"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
                setCancelAdminNotes("");
                setCancelError("");
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling || !cancelReason.trim()}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Why is this order being cancelled?"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Admin Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Internal notes for the team"
              value={cancelAdminNotes}
              onChange={(e) => setCancelAdminNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {order.payment?.status === "success" &&
            order.payment?.method !== "cod" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
                This order was paid online. A refund will be initiated
                automatically via Cashfree.
              </div>
            )}
          {cancelError && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {cancelError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const PriceRow = ({ label, value, muted, accent }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs ${muted ? "text-slate-400" : "text-slate-500"}`}>
      {label}
    </span>
    <span
      className={`text-xs font-semibold ${
        accent
          ? "text-emerald-600"
          : muted
          ? "text-slate-400 line-through"
          : "text-slate-700"
      }`}
    >
      {value}
    </span>
  </div>
);

export default OrderDetailPage;
