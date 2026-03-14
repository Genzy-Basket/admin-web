import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ShoppingBag, RefreshCw, Truck, CheckCircle2, Loader2,
  PackageCheck, Repeat, ChevronRight, MapPin, Phone,
} from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { subscriptionApi } from "../../../api/endpoints/subscription.api";
import { errorBus } from "../../../api/errorBus";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { PageContainer, Badge } from "../../../components/shared";

const TABS = [
  { key: "subscriptions", label: "Subscriptions", icon: Repeat },
  { key: "to_pack",       label: "To Pack",       icon: Package },
  { key: "packed",        label: "Packed",         icon: PackageCheck },
];

const STATUS_CONFIG = {
  pending:          { label: "Pending",          variant: "warning" },
  confirmed:        { label: "Confirmed",        variant: "info" },
  processing:       { label: "Processing",       variant: "primary" },
  packed:           { label: "Packed",           variant: "success" },
  out_for_delivery: { label: "Out for Delivery", variant: "warning" },
  delivered:        { label: "Delivered",         variant: "success" },
  cancelled:        { label: "Cancelled",        variant: "danger" },
  refunded:         { label: "Refunded",         variant: "secondary" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const dateStr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const todayDateStr = () => dateStr(new Date());

const tomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateStr(d);
};

const aggregateItems = (orders) => {
  const map = {};
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const name = item.productSnapshot?.name ?? item.productId?.name ?? "Unknown";
      const unit = item.value && item.unit ? `${item.value} ${item.unit}` : item.unit ?? "";
      const key = `${name}__${unit}`;
      if (!map[key]) map[key] = { name, unit, qty: 0 };
      map[key].qty += item.quantity ?? 0;
    }
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
};

const aggregateSubItems = (subscriptions) => {
  const map = {};
  for (const sub of subscriptions) {
    for (const item of sub.items ?? []) {
      const name = item.productSnapshot?.name ?? "Unknown";
      const unit = item.displayLabel ?? "";
      const key = `${name}__${unit}`;
      if (!map[key]) map[key] = { name, unit, qty: 0 };
      map[key].qty += item.quantity ?? 0;
    }
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
};

// ── Item row (packing list) ─────────────────────────────────────────────────
const ItemRow = ({ name, qty, unit }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-semibold text-slate-700">{name}</span>
    <span className="text-sm font-black text-[#099E0E]">
      {qty} <span className="font-medium text-slate-400 text-xs">{unit}</span>
    </span>
  </div>
);

// ── Order card with action button ────────────────────────────────────────────
const OrderCard = ({ order, onClick, actionLabel, actionIcon: ActionIcon, onAction, acting }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
    <div
      onClick={onClick}
      className="cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="font-mono text-xs font-bold text-[#099E0E]">#{order.orderId}</span>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">
            {order.userId?.fullName || "—"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {order.userId?.phoneNumber && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Phone className="w-3 h-3" />
                {order.userId.phoneNumber}
              </span>
            )}
          </div>
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

      {/* Address snippet */}
      {order.deliveryAddress && (
        <div className="flex items-start gap-1.5 mb-2 text-xs text-slate-400">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            {order.deliveryAddress.houseOrFlat}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
          </span>
        </div>
      )}

      <div className="space-y-1">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{item.productSnapshot?.name ?? item.productId?.name ?? "Unknown"}</span>
            <span className="font-bold text-slate-700">{item.quantity} x {item.value} {item.unit}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {order.items?.length ?? 0} items · {order.payment?.method?.toUpperCase()}
        </span>
        <span className="text-sm font-black text-slate-800">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
      </div>
    </div>

    {/* Action button */}
    {onAction && (
      <button
        onClick={(e) => { e.stopPropagation(); onAction(); }}
        disabled={acting}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all"
      >
        {acting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : ActionIcon && <ActionIcon className="w-4 h-4" />
        }
        {actionLabel}
      </button>
    )}
  </div>
);

// ── Subscription card (minimal) ─────────────────────────────────────────────
const SubCard = ({ sub, actionLabel, actionIcon: ActionIcon, onAction, acting }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3 mb-2">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {sub.userId?.fullName || "—"}
        </p>
        {sub.userId?.phoneNumber && (
          <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Phone className="w-3 h-3" />
            {sub.userId.phoneNumber}
          </span>
        )}
      </div>
      <Badge variant="primary" size="xs">Subscription</Badge>
    </div>

    <div className="space-y-1">
      {sub.items?.map((item, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-slate-600">{item.productSnapshot?.name ?? "Unknown"}</span>
          <span className="font-bold text-slate-700">{item.quantity} x {item.displayLabel}</span>
        </div>
      ))}
    </div>

    {onAction && (
      <button
        onClick={onAction}
        disabled={acting}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
      >
        {acting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : ActionIcon && <ActionIcon className="w-4 h-4" />
        }
        {actionLabel}
      </button>
    )}
  </div>
);

// ── Empty state ──────────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, title, subtitle }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
    <Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
    <p className="font-bold text-slate-500">{title}</p>
    {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
const PackingPage = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, updateStatus, bulkPack, bulkOutForDelivery } = useOrders();

  const [tab, setTab] = useState("to_pack");
  const [actingId, setActingId] = useState(null);
  const [bulking, setBulking] = useState(null); // "pack" | "ofd" | "delivered" | "sub_deliver"

  // Subscription state
  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [deliveringSubId, setDeliveringSubId] = useState(null);
  const [packingSubId, setPackingSubId] = useState(null);

  const today = todayDateStr();
  const tomorrow = tomorrowDateStr();

  const load = useCallback(() => {
    fetchOrders({ startDate: today });
  }, [fetchOrders, today]);

  const loadSubs = useCallback(async () => {
    setSubsLoading(true);
    try {
      const res = await subscriptionApi.getAll({ status: "active", limit: 200 });
      const all = res.subscriptions || [];
      // Filter to subscriptions that have tomorrow as an upcoming or packed delivery
      const tomorrowSubs = all.filter((s) =>
        s.deliveryDates?.some(
          (dd) => ["upcoming", "packed"].includes(dd.status) && dd.date?.slice(0, 10) === tomorrow,
        ),
      );
      setSubs(tomorrowSubs);
    } catch {
      setSubs([]);
    } finally {
      setSubsLoading(false);
    }
  }, [tomorrow]);

  useEffect(() => { load(); loadSubs(); }, [load, loadSubs]);

  usePageMeta({
    title: "Packing",
    onRefresh: () => { load(); loadSubs(); },
  });

  // ── Filtered order lists ──
  const toPackOrders = orders.filter((o) =>
    ["pending", "confirmed", "processing"].includes(o.orderStatus),
  );
  const packedOrders = orders.filter((o) => o.orderStatus === "packed");

  // ── Split subscriptions by tomorrow's delivery date status ──
  const getSubDateStatus = (s) =>
    s.deliveryDates?.find((dd) => dd.date?.slice(0, 10) === tomorrow)?.status;
  const unpackedSubs = subs.filter((s) => getSubDateStatus(s) === "upcoming");
  const packedSubs = subs.filter((s) => getSubDateStatus(s) === "packed");

  // ── Aggregated items for current tab ──
  const packingList = tab === "to_pack"
    ? aggregateItems(toPackOrders)
    : tab === "packed"
      ? aggregateItems(packedOrders)
      : aggregateSubItems(unpackedSubs);
  const totalItems = packingList.reduce((s, i) => s + i.qty, 0);

  // ── Actions ──
  const handleMarkPacked = async (orderId) => {
    setActingId(orderId);
    await updateStatus(orderId, "packed");
    setActingId(null);
  };

  const handleBulkPack = async () => {
    if (!toPackOrders.length) return;
    setBulking("pack");
    await bulkPack();
    setBulking(null);
  };

  const handleBulkOutForDelivery = async () => {
    if (!packedOrders.length) return;
    setBulking("ofd");
    await bulkOutForDelivery();
    setBulking(null);
  };

  const handleBulkDelivered = async () => {
    if (!packedOrders.length) return;
    setBulking("delivered");
    await Promise.all(packedOrders.map((o) => updateStatus(o.orderId, "delivered")));
    setBulking(null);
  };

  const handleSubPack = async (subId) => {
    setPackingSubId(subId);
    try {
      await subscriptionApi.markPacked(subId, tomorrow);
      errorBus.emit("Subscription marked as packed", "success");
      loadSubs();
    } catch (err) {
      errorBus.emit(err.message || "Failed to mark packed", "error");
    }
    setPackingSubId(null);
  };

  const handleSubDeliver = async (subId) => {
    setDeliveringSubId(subId);
    try {
      await subscriptionApi.markDelivered(subId, tomorrow);
      errorBus.emit("Subscription delivery marked", "success");
      loadSubs();
    } catch (err) {
      errorBus.emit(err.message || "Failed to mark delivered", "error");
    }
    setDeliveringSubId(null);
  };

  const handleBulkSubDeliver = async () => {
    if (!packedSubs.length) return;
    setBulking("sub_deliver");
    try {
      const res = await subscriptionApi.bulkMarkDelivered(tomorrow);
      errorBus.emit(res.message || "All subscriptions delivered", "success");
      loadSubs();
    } catch (err) {
      errorBus.emit(err.message || "Bulk deliver failed", "error");
    }
    setBulking(null);
  };

  const isLoading = loading || (tab === "subscriptions" && subsLoading);

  return (
    <PageContainer gradient="slate">
      <h1 className="hidden sm:block text-2xl font-black text-slate-900 mb-6">Packing</h1>

      {/* ── Tab bar ── */}
      <div className="flex bg-white rounded-2xl border border-slate-200 p-1 mb-5 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count =
            key === "subscriptions" ? unpackedSubs.length :
            key === "to_pack" ? toPackOrders.length :
            packedOrders.length + packedSubs.length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === key
                  ? "bg-[#099E0E] text-white shadow-md"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${
                  tab === key ? "bg-white/25" : "bg-slate-100"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bulk actions bar ── */}
      {tab === "to_pack" && toPackOrders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-[#099E0E]" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">{toPackOrders.length} orders to pack</p>
                <p className="text-xs text-[#099E0E] mt-0.5">{totalItems} total items</p>
              </div>
            </div>
            <button onClick={() => { load(); loadSubs(); }} className="p-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleBulkPack}
            disabled={bulking === "pack"}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all"
          >
            {bulking === "pack"
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <PackageCheck className="w-4 h-4" />
            }
            Pack All Orders
            <span className="bg-white/25 text-xs font-bold px-1.5 py-0.5 rounded-lg">{toPackOrders.length}</span>
          </button>
        </div>
      )}

      {tab === "packed" && (packedOrders.length > 0 || packedSubs.length > 0) && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <PackageCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {packedOrders.length + packedSubs.length} packed, ready to dispatch
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {packedOrders.length > 0 && (
              <>
                <button
                  onClick={handleBulkOutForDelivery}
                  disabled={bulking === "ofd"}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all"
                >
                  {bulking === "ofd"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Truck className="w-4 h-4" />
                  }
                  Out for Delivery
                </button>
                <button
                  onClick={handleBulkDelivered}
                  disabled={bulking === "delivered"}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all"
                >
                  {bulking === "delivered"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />
                  }
                  Mark Delivered
                </button>
              </>
            )}
            {packedSubs.length > 0 && (
              <button
                onClick={handleBulkSubDeliver}
                disabled={bulking === "sub_deliver"}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                {bulking === "sub_deliver"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4" />
                }
                Deliver Subscriptions
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "subscriptions" && unpackedSubs.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Repeat className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800">{unpackedSubs.length} subscriptions to pack</p>
                <p className="text-xs text-purple-600 mt-0.5">{totalItems} total items</p>
              </div>
            </div>
            <button onClick={loadSubs} className="p-2 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-100 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#099E0E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Subscriptions tab ── */}
          {tab === "subscriptions" && (
            unpackedSubs.length === 0 ? (
              <Empty icon={Repeat} title="No subscription deliveries tomorrow" subtitle="Active subscriptions with tomorrow's delivery will appear here" />
            ) : (
              <div className="space-y-3">
                {unpackedSubs.map((sub) => (
                  <SubCard
                    key={sub._id}
                    sub={sub}
                    actionLabel="Mark Packed"
                    actionIcon={PackageCheck}
                    onAction={() => handleSubPack(sub.subscriptionId)}
                    acting={packingSubId === sub.subscriptionId}
                  />
                ))}
              </div>
            )
          )}

          {/* ── To Pack tab ── */}
          {tab === "to_pack" && (
            toPackOrders.length === 0 ? (
              <Empty icon={Package} title="All orders packed!" subtitle="New orders will appear here when placed" />
            ) : (
              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                    Packing List — {totalItems} items
                  </h2>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    {packingList.map((item) => (
                      <ItemRow key={`${item.name}__${item.unit}`} {...item} />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                    Orders
                  </h2>
                  <div className="space-y-3">
                    {toPackOrders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        actionLabel="Mark Packed"
                        actionIcon={PackageCheck}
                        onAction={() => handleMarkPacked(order.orderId)}
                        acting={actingId === order.orderId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* ── Packed tab ── */}
          {tab === "packed" && (
            packedOrders.length === 0 && packedSubs.length === 0 ? (
              <Empty icon={PackageCheck} title="No packed items" subtitle="Orders and subscriptions will appear here after packing" />
            ) : (
              <div className="space-y-6">
                {packedOrders.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                      Orders — {packedOrders.length}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packedOrders.map((order) => (
                        <OrderCard
                          key={order._id}
                          order={order}
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {packedSubs.length > 0 && (
                  <div>
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                      Subscriptions — {packedSubs.length}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packedSubs.map((sub) => (
                        <SubCard
                          key={sub._id}
                          sub={sub}
                          actionLabel="Mark Delivered"
                          actionIcon={CheckCircle2}
                          onAction={() => handleSubDeliver(sub.subscriptionId)}
                          acting={deliveringSubId === sub.subscriptionId}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
    </PageContainer>
  );
};

export default PackingPage;
