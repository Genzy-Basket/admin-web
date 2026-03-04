import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag, RefreshCw, Truck, CheckCircle2, Loader2 } from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { PageContainer, Badge } from "../../../components/shared";

// Today midnight → 11:00 PM (orders placed any time today up to cutoff)
const getPackingWindow = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0);
  return { start, end };
};

const STATUS_CONFIG = {
  pending:          { label: "Pending",          variant: "warning"   },
  confirmed:        { label: "Confirmed",         variant: "info"      },
  processing:       { label: "Processing",        variant: "primary"   },
  out_for_delivery: { label: "Out for Delivery",  variant: "warning"   },
  delivered:        { label: "Delivered",         variant: "success"   },
  cancelled:        { label: "Cancelled",         variant: "danger"    },
  refunded:         { label: "Refunded",          variant: "secondary" },
};

const aggregateItems = (orders) => {
  const map = {};
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const name = item.productSnapshot?.name ?? item.productId?.name ?? "Unknown";
      const unit = item.value && item.unit ? `${item.value} ${item.unit}` : item.unit ?? "";
      const key  = `${name}__${unit}`;
      if (!map[key]) map[key] = { name, unit, qty: 0 };
      map[key].qty += item.quantity ?? 0;
    }
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
};

// ── Item row ──────────────────────────────────────────────────────────────────
const ItemRow = ({ name, qty, unit }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-semibold text-slate-700">{name}</span>
    <span className="text-sm font-black text-[#009661]">
      {qty} <span className="font-medium text-slate-400 text-xs">{unit}</span>
    </span>
  </div>
);

// ── Order card ────────────────────────────────────────────────────────────────
const PackingOrderCard = ({ order, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <span className="font-mono text-xs font-bold text-[#009661]">#{order.orderId}</span>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">
          {order.userId?.fullName || "—"}
        </p>
        <p className="text-xs text-slate-400">{order.userId?.phoneNumber || order.userId?.email || ""}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant={STATUS_CONFIG[order.orderStatus]?.variant || "secondary"} size="xs">
          {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
        </Badge>
        <span className="text-xs text-slate-400">
          {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
        </span>
      </div>
    </div>
    <div className="space-y-1">
      {order.items?.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-slate-600">{item.productSnapshot?.name ?? item.productId?.name ?? "Unknown"}</span>
          <span className="font-bold text-slate-700">{item.quantity} x {item.value} {item.unit}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
      <span className="text-xs text-slate-400">{order.items?.length ?? 0} items</span>
      <span className="text-sm font-black text-slate-800">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const PackingPage = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, updateStatus } = useOrders();
  const [bulkingDelivery, setBulkingDelivery] = useState(false);
  const [bulkingDelivered, setBulkingDelivered] = useState(false);

  const load = useCallback(() => {
    const { start } = getPackingWindow();
    fetchOrders({ startDate: start.toISOString().slice(0, 10) });
  }, [fetchOrders]);

  useEffect(() => { load(); }, [load]);

  usePageMeta({ title: "Packing", onRefresh: load });

  const { start, end } = getPackingWindow();
  const packingOrders = orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

  const aggregated = aggregateItems(packingOrders);
  const totalItems = aggregated.reduce((s, i) => s + i.qty, 0);

  // Orders eligible for each bulk action (skip already-done ones)
  const notYetOutForDelivery = packingOrders.filter(
    (o) => !["out_for_delivery", "delivered", "cancelled", "refunded"].includes(o.orderStatus)
  );
  const notYetDelivered = packingOrders.filter(
    (o) => !["delivered", "cancelled", "refunded"].includes(o.orderStatus)
  );

  const handleBulkOutForDelivery = async () => {
    if (!notYetOutForDelivery.length) return;
    setBulkingDelivery(true);
    await Promise.all(notYetOutForDelivery.map((o) => updateStatus(o.orderId, "out_for_delivery")));
    setBulkingDelivery(false);
  };

  const handleBulkDelivered = async () => {
    if (!notYetDelivered.length) return;
    setBulkingDelivered(true);
    await Promise.all(notYetDelivered.map((o) => updateStatus(o.orderId, "delivered")));
    setBulkingDelivered(false);
  };

  return (
    <PageContainer gradient="slate">
      <h1 className="hidden sm:block text-2xl font-black text-slate-900 mb-6">Packing</h1>

      {/* ── Header banner + bulk actions ── */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-[#009661]" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Today's Packing Window</p>
              <p className="text-xs text-[#009661] mt-0.5">
                Orders placed <strong>today up to 11:00 PM</strong> · {packingOrders.length} orders
              </p>
            </div>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bulk action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBulkOutForDelivery}
            disabled={bulkingDelivery || notYetOutForDelivery.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {bulkingDelivery
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Truck className="w-4 h-4" />
            }
            Out for Delivery
            {notYetOutForDelivery.length > 0 && (
              <span className="bg-white/25 text-xs font-bold px-1.5 py-0.5 rounded-lg">
                {notYetOutForDelivery.length}
              </span>
            )}
          </button>

          <button
            onClick={handleBulkDelivered}
            disabled={bulkingDelivered || notYetDelivered.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#009661] text-white text-sm font-bold rounded-xl hover:bg-[#007d51] disabled:opacity-50 transition-all"
          >
            {bulkingDelivered
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />
            }
            Mark Delivered
            {notYetDelivered.length > 0 && (
              <span className="bg-white/25 text-xs font-bold px-1.5 py-0.5 rounded-lg">
                {notYetDelivered.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#009661] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : packingOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-500">No orders in packing window</p>
          <p className="text-sm text-slate-400 mt-1">Orders placed today up to 11 PM will appear here</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* ── Aggregated packing list ── */}
          <div>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
              Packing List — {totalItems} total items
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              {aggregated.map((item) => (
                <ItemRow key={`${item.name}__${item.unit}`} {...item} />
              ))}
            </div>
          </div>

          {/* ── Individual orders ── */}
          <div>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
              Orders
            </h2>
            <div className="space-y-3">
              {packingOrders.map((order) => (
                <PackingOrderCard
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/orders/${order.orderId}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default PackingPage;
