import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  TrendingUp,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Filter,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useOrders } from "../context/OrderContext";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { PageContainer, Badge } from "../../../components/shared";

// ── Delivery schedule (mirrors backend/src/config/delivery.config.js) ────────
// Change these when you update the backend config file.
const DELIVERY_CONFIG = {
  orderCutoffHour: 23,
  orderCutoffMinute: 0,
  deliveryByHour: 7,
  deliveryByMinute: 30,
};

const fmt12 = (h, m) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ── Status config ─────────────────────────────────────────────────────────────
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

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-black text-slate-800 leading-tight truncate">
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ── Mobile order card ─────────────────────────────────────────────────────────
const OrderCard = ({ order, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <span className="font-mono text-xs font-bold text-indigo-600">
          #{order.orderId}
        </span>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
          {order.userId?.fullName || "—"}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {order.userId?.phoneNumber || order.userId?.email || ""}
        </p>
      </div>
      <Badge
        variant={STATUS_CONFIG[order.orderStatus]?.variant || "secondary"}
        size="xs"
      >
        {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
      </Badge>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={
            PAYMENT_STATUS_CONFIG[order.payment?.status]?.variant || "secondary"
          }
          size="xs"
        >
          {order.payment?.method === "cod" ? "COD · " : ""}
          {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label ||
            order.payment?.status}
        </Badge>
        <span className="text-xs text-slate-400">
          {order.items?.length ?? 0}{" "}
          {order.items?.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-800">
          ₹{order.totalAmount?.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-slate-400">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    stats,
    pagination,
    loading,
    fetchOrders,
    fetchStats,
    bulkOutForDelivery,
  } = useOrders();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const [bulking, setBulking] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const applyFilters = useCallback(
    (overrides = {}) => {
      const params = { ...filters, ...overrides };
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== ""),
      );
      fetchOrders(clean);
    },
    [filters, fetchOrders],
  );

  // Header refresh reloads current filtered view + stats
  const handleRefresh = useCallback(async () => {
    const params = { ...filters };
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== ""),
    );
    await fetchOrders(clean, true);
    await fetchStats(true);
  }, [filters, fetchOrders, fetchStats]);

  usePageMeta({ title: "Orders", onRefresh: handleRefresh });

  useEffect(() => {
    applyFilters();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== ""),
    );
    fetchOrders(clean);
  };

  const handleStatusFilter = (status) => {
    const next = { ...filters, status, page: 1 };
    setFilters(next);
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== ""),
    );
    fetchOrders(clean);
  };

  const handleDateChange = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== ""),
    );
    fetchOrders(clean);
  };

  const handlePage = (newPage) => {
    const next = { ...filters, page: newPage };
    setFilters(next);
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== ""),
    );
    fetchOrders(clean);
  };

  const handleBulkOutForDelivery = async () => {
    setBulking(true);
    setBulkResult(null);
    const result = await bulkOutForDelivery();
    setBulking(false);
    setBulkResult(result);
    fetchStats();
    if (result.success) setTimeout(() => setBulkResult(null), 5000);
  };

  // Stats
  const totalOrders = stats
    ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
    : 0;
  const pendingCount = stats?.byStatus?.pending ?? 0;
  const todayRevenue = stats?.today?.revenue ?? 0;
  const allTimeRevenue = stats?.allTime?.revenue ?? 0;
  const dispatchableCount =
    (stats?.byStatus?.confirmed ?? 0) + (stats?.byStatus?.processing ?? 0);

  return (
    <PageContainer gradient="slate">
      {/* Desktop page title */}
      <h1 className="hidden sm:block text-2xl font-black text-slate-900 mb-6">
        Orders
      </h1>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          sub={`${stats?.allTime?.orders ?? 0} paid`}
          icon={ShoppingBag}
          color="bg-indigo-500"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          sub="Awaiting action"
          icon={Filter}
          color="bg-amber-500"
        />
        <StatCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString("en-IN")}`}
          sub={`${stats?.today?.orders ?? 0} orders`}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <StatCard
          label="All-Time Revenue"
          value={`₹${allTimeRevenue.toLocaleString("en-IN")}`}
          sub="Paid orders only"
          icon={IndianRupee}
          color="bg-violet-500"
        />
      </div>

      {/* ── Delivery Schedule + Bulk Action ────────────────────────────── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">
              Delivery Pooling Schedule
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Orders before{" "}
              <strong>
                {fmt12(
                  DELIVERY_CONFIG.orderCutoffHour,
                  DELIVERY_CONFIG.orderCutoffMinute,
                )}
              </strong>{" "}
              → delivered by{" "}
              <strong>
                {fmt12(
                  DELIVERY_CONFIG.deliveryByHour,
                  DELIVERY_CONFIG.deliveryByMinute,
                )}
              </strong>{" "}
              next morning
            </p>
            <p className="text-xs text-indigo-400 mt-0.5">
              Edit{" "}
              <code className="bg-indigo-100 px-1 rounded">
                backend/src/config/delivery.config.js
              </code>{" "}
              to change the schedule
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {bulkResult && (
            <p
              className={`text-xs font-medium flex items-center gap-1 ${
                bulkResult.success ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {bulkResult.success ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {bulkResult.message}
            </p>
          )}
          <button
            onClick={handleBulkOutForDelivery}
            disabled={bulking || dispatchableCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {bulking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            Mark All Out for Delivery
            {dispatchableCount > 0 && (
              <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
                {dispatchableCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID…"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Search
            </button>
          </form>

          {/* Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-0 flex-1 lg:flex-none"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-0 flex-1 lg:flex-none"
            />
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              filters.status === ""
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                filters.status === s
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {STATUS_CONFIG[s].label}
              {stats?.byStatus?.[s] != null && (
                <span className="ml-1 opacity-70">({stats.byStatus[s]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Order list ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-500">No orders found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          {/* Mobile — cards */}
          <div className="lg:hidden space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => navigate(`/orders/${order.orderId}`)}
              />
            ))}
          </div>

          {/* Desktop — table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    "Order ID",
                    "Customer",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        #{order.orderId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {order.userId?.fullName || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.userId?.phoneNumber || order.userId?.email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.items?.length ?? 0}{" "}
                      {order.items?.length === 1 ? "item" : "items"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          PAYMENT_STATUS_CONFIG[order.payment?.status]
                            ?.variant || "secondary"
                        }
                        size="xs"
                      >
                        {order.payment?.method === "cod" ? "COD · " : ""}
                        {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label ||
                          order.payment?.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          STATUS_CONFIG[order.orderStatus]?.variant ||
                          "secondary"
                        }
                        size="xs"
                      >
                        {STATUS_CONFIG[order.orderStatus]?.label ||
                          order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-slate-500">
                Page {pagination.currentPage} of {pagination.totalPages} —{" "}
                {pagination.totalOrders} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePage(pagination.currentPage + 1)}
                  disabled={!pagination.hasMore}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default OrdersPage;
