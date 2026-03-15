import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, CreditCard, ArrowUpCircle, ArrowDownCircle,
  Search, ChevronLeft, ChevronRight,
  Phone, IndianRupee, X, Repeat,
} from "lucide-react";
import { useTransactions } from "../context/TransactionContext";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { PageContainer, Badge } from "../../../components/shared";

const TABS = [
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "payments", label: "Order Payments", icon: CreditCard },
  { key: "subscriptions", label: "Subscriptions", icon: Repeat },
];

// ── Wallet transaction type/status configs ───────────────────────────────────
const TXN_TYPE_CONFIG = {
  credit: { label: "Credit", variant: "success", icon: ArrowUpCircle },
  debit: { label: "Debit", variant: "danger", icon: ArrowDownCircle },
};

const TXN_STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" },
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
};

// ── Payment configs ──────────────────────────────────────────────────────────
const PAYMENT_METHOD_CONFIG = {
  online: { label: "Online", variant: "info" },
  wallet: { label: "Wallet", variant: "primary" },
  cod: { label: "COD", variant: "warning" },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "info" },
  success: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "secondary" },
};

const ORDER_STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "primary" },
  packed: { label: "Packed", variant: "success" },
  out_for_delivery: { label: "Out for Delivery", variant: "warning" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  refunded: { label: "Refunded", variant: "secondary" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtAmount = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-5 flex items-center gap-3 shadow-sm">
    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm sm:text-xl font-black text-slate-900 truncate">{value}</p>
      {sub && <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{sub}</p>}
    </div>
  </div>
);

// ── User cell ────────────────────────────────────────────────────────────────
const UserCell = ({ user }) => {
  if (!user) return <span className="text-slate-400">—</span>;
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName || "—"}</p>
      {user.phoneNumber && (
        <span className="flex items-center gap-0.5 text-xs text-slate-400 mt-0.5">
          <Phone className="w-3 h-3" />
          {user.phoneNumber}
        </span>
      )}
    </div>
  );
};

// ── Filter bar ───────────────────────────────────────────────────────────────
const FilterBar = ({ filters, onChange, options, onSearch, searchPlaceholder }) => {
  const [search, setSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(search);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v && k !== "search" && k !== "page",
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-5 shadow-sm">
      {/* Search row — always visible */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl border transition-all sm:hidden ${
            hasActiveFilters
              ? "border-[#099E0E] bg-emerald-50 text-[#099E0E]"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M3 4h18M7 9h10M10 14h4" strokeLinecap="round" />
          </svg>
        </button>
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() => { setSearch(""); onChange({}); }}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter controls — always visible on desktop, toggled on mobile */}
      <div className={`mt-3 gap-2 flex-wrap ${showFilters ? "flex" : "hidden sm:flex"}`}>
        {options.map(({ key, label, values }) => (
          <select
            key={key}
            value={filters[key] || ""}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value || undefined, page: 1 })}
            className="flex-1 min-w-[100px] sm:flex-none px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
          >
            <option value="">{label}</option>
            {values.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        ))}
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined, page: 1 })}
          className="flex-1 min-w-[120px] sm:flex-none px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
        />
        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined, page: 1 })}
          className="flex-1 min-w-[120px] sm:flex-none px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
        />
      </div>
    </div>
  );
};

// ── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-5">
      <p className="text-xs text-slate-500">
        Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPage(pagination.currentPage + 1)}
          disabled={!pagination.hasMore}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Wallet Transactions ─────────────────────────────────────────────────────
const WalletTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#099E0E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center shadow-sm">
        <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500">No wallet transactions found</p>
        <p className="text-sm text-slate-400 mt-1">Adjust your filters or date range</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Type</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Order / Txn ID</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const TypeIcon = TXN_TYPE_CONFIG[txn.type]?.icon || ArrowUpCircle;
              return (
                <tr key={txn._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3"><UserCell user={txn.userId} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <TypeIcon className={`w-4 h-4 ${txn.type === "credit" ? "text-emerald-500" : "text-rose-500"}`} />
                      <Badge variant={TXN_TYPE_CONFIG[txn.type]?.variant || "secondary"} size="xs">
                        {TXN_TYPE_CONFIG[txn.type]?.label || txn.type}
                      </Badge>
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-black ${txn.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {txn.type === "credit" ? "+" : "-"}{fmtAmount(txn.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TXN_STATUS_CONFIG[txn.status]?.variant || "secondary"} size="xs">
                      {TXN_STATUS_CONFIG[txn.status]?.label || txn.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                    {txn.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {txn.relatedOrderId && (
                      <span className="font-mono text-[#099E0E]">{txn.relatedOrderId}</span>
                    )}
                    {txn.cashfreeOrderId && !txn.relatedOrderId && (
                      <span className="font-mono text-slate-400">{txn.cashfreeOrderId}</span>
                    )}
                    {!txn.relatedOrderId && !txn.cashfreeOrderId && "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(txn.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-slate-100">
        {transactions.map((txn) => {
          const TypeIcon = TXN_TYPE_CONFIG[txn.type]?.icon || ArrowUpCircle;
          return (
            <div key={txn._id} className="p-3.5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{txn.userId?.fullName || "—"}</p>
                  {txn.userId?.phoneNumber && (
                    <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                      <Phone className="w-3 h-3" />
                      {txn.userId.phoneNumber}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-black shrink-0 ${txn.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                  {txn.type === "credit" ? "+" : "-"}{fmtAmount(txn.amount)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <TypeIcon className={`w-3 h-3 ${txn.type === "credit" ? "text-emerald-500" : "text-rose-500"}`} />
                  <Badge variant={TXN_TYPE_CONFIG[txn.type]?.variant || "secondary"} size="xs">
                    {TXN_TYPE_CONFIG[txn.type]?.label || txn.type}
                  </Badge>
                </div>
                <Badge variant={TXN_STATUS_CONFIG[txn.status]?.variant || "secondary"} size="xs">
                  {TXN_STATUS_CONFIG[txn.status]?.label || txn.status}
                </Badge>
                <span className="text-[11px] text-slate-400 ml-auto">{fmtDate(txn.createdAt)}</span>
              </div>
              {txn.description && (
                <p className="text-[11px] text-slate-500 mt-1.5 truncate">{txn.description}</p>
              )}
              {txn.relatedOrderId && (
                <p className="text-[11px] text-[#099E0E] font-mono mt-0.5">{txn.relatedOrderId}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Order Payments ───────────────────────────────────────────────────────────
const PaymentsTable = ({ payments, loading, onOrderClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#099E0E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center shadow-sm">
        <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500">No order payments found</p>
        <p className="text-sm text-slate-400 mt-1">Adjust your filters or date range</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Order</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Method</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Order Status</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Txn ID</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((order) => (
              <tr
                key={order._id}
                onClick={() => onOrderClick(order.orderId)}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-[#099E0E]">#{order.orderId}</span>
                </td>
                <td className="px-4 py-3"><UserCell user={order.userId} /></td>
                <td className="px-4 py-3">
                  <Badge variant={PAYMENT_METHOD_CONFIG[order.payment?.method]?.variant || "secondary"} size="xs">
                    {PAYMENT_METHOD_CONFIG[order.payment?.method]?.label || order.payment?.method}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-black text-slate-800">
                  {fmtAmount(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={PAYMENT_STATUS_CONFIG[order.payment?.status]?.variant || "secondary"} size="xs">
                    {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label || order.payment?.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ORDER_STATUS_CONFIG[order.orderStatus]?.variant || "secondary"} size="xs">
                    {ORDER_STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono max-w-[140px] truncate">
                  {order.payment?.transactionId || order.payment?.cashfreePaymentId || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-slate-100">
        {payments.map((order) => (
          <div
            key={order._id}
            onClick={() => onOrderClick(order.orderId)}
            className="p-3.5 cursor-pointer active:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-[#099E0E]">#{order.orderId}</span>
                <p className="text-sm font-semibold text-slate-800 truncate">{order.userId?.fullName || "—"}</p>
                {order.userId?.phoneNumber && (
                  <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                    <Phone className="w-3 h-3" />
                    {order.userId.phoneNumber}
                  </span>
                )}
              </div>
              <span className="text-sm font-black text-slate-800 shrink-0">{fmtAmount(order.totalAmount)}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={PAYMENT_METHOD_CONFIG[order.payment?.method]?.variant || "secondary"} size="xs">
                {PAYMENT_METHOD_CONFIG[order.payment?.method]?.label || order.payment?.method}
              </Badge>
              <Badge variant={PAYMENT_STATUS_CONFIG[order.payment?.status]?.variant || "secondary"} size="xs">
                {PAYMENT_STATUS_CONFIG[order.payment?.status]?.label || order.payment?.status}
              </Badge>
              <Badge variant={ORDER_STATUS_CONFIG[order.orderStatus]?.variant || "secondary"} size="xs">
                {ORDER_STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
              </Badge>
              <span className="text-[11px] text-slate-400 ml-auto">{fmtDate(order.createdAt)}</span>
            </div>
            {(order.payment?.transactionId || order.payment?.cashfreePaymentId) && (
              <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                Txn: {order.payment.transactionId || order.payment.cashfreePaymentId}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Subscription Payments ────────────────────────────────────────────────────
const SubPaymentsTable = ({ subscriptions, loading, onSubClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#099E0E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subscriptions.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 text-center shadow-sm">
        <Repeat className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500">No subscription payments found</p>
        <p className="text-sm text-slate-400 mt-1">Adjust your filters or date range</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Subscription</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Method</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr
                key={sub._id}
                onClick={() => onSubClick(sub._id)}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-[#099E0E]">#{sub.subscriptionId}</span>
                </td>
                <td className="px-4 py-3"><UserCell user={sub.userId} /></td>
                <td className="px-4 py-3">
                  <Badge variant={PAYMENT_METHOD_CONFIG[sub.paymentMethod]?.variant || "secondary"} size="xs">
                    {PAYMENT_METHOD_CONFIG[sub.paymentMethod]?.label || sub.paymentMethod}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-black text-slate-800">
                  {fmtAmount(sub.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={PAYMENT_STATUS_CONFIG[sub.paymentStatus]?.variant || "secondary"} size="xs">
                    {PAYMENT_STATUS_CONFIG[sub.paymentStatus]?.label || sub.paymentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ORDER_STATUS_CONFIG[sub.status]?.variant || "secondary"} size="xs">
                    {ORDER_STATUS_CONFIG[sub.status]?.label || sub.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(sub.paidAt || sub.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-slate-100">
        {subscriptions.map((sub) => (
          <div
            key={sub._id}
            onClick={() => onSubClick(sub._id)}
            className="p-3.5 cursor-pointer active:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-[#099E0E]">#{sub.subscriptionId}</span>
                <p className="text-sm font-semibold text-slate-800 truncate">{sub.userId?.fullName || "—"}</p>
                {sub.userId?.phoneNumber && (
                  <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                    <Phone className="w-3 h-3" />
                    {sub.userId.phoneNumber}
                  </span>
                )}
              </div>
              <span className="text-sm font-black text-slate-800 shrink-0">{fmtAmount(sub.totalAmount)}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={PAYMENT_METHOD_CONFIG[sub.paymentMethod]?.variant || "secondary"} size="xs">
                {PAYMENT_METHOD_CONFIG[sub.paymentMethod]?.label || sub.paymentMethod}
              </Badge>
              <Badge variant={PAYMENT_STATUS_CONFIG[sub.paymentStatus]?.variant || "secondary"} size="xs">
                {PAYMENT_STATUS_CONFIG[sub.paymentStatus]?.label || sub.paymentStatus}
              </Badge>
              <span className="text-[11px] text-slate-400 ml-auto">{fmtDate(sub.paidAt || sub.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const TransactionsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("wallet");

  const {
    stats,
    walletTxns, walletPagination, walletLoading, walletFilters,
    payments, paymentPagination, paymentLoading, paymentFilters,
    subPayments, subPaymentPagination, subPaymentLoading, subPaymentFilters,
    fetchStats, fetchWallet, fetchPayments, fetchSubPayments,
  } = useTransactions();

  useEffect(() => {
    fetchStats();
    fetchWallet(walletFilters);
    fetchPayments(paymentFilters);
    fetchSubPayments(subPaymentFilters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  usePageMeta({
    title: "Transactions",
    onRefresh: () => {
      fetchStats(true);
      if (tab === "wallet") fetchWallet(walletFilters, true);
      else if (tab === "payments") fetchPayments(paymentFilters, true);
      else fetchSubPayments(subPaymentFilters, true);
    },
  });

  // ── Filter handlers ──
  const handleWalletFilters = (f) => {
    fetchWallet(f, true);
  };

  const handlePaymentFilters = (f) => {
    fetchPayments(f, true);
  };

  const handleWalletSearch = (search) => {
    const f = { ...walletFilters, search: search || undefined, page: 1 };
    fetchWallet(f, true);
  };

  const handlePaymentSearch = (search) => {
    const f = { ...paymentFilters, search: search || undefined, page: 1 };
    fetchPayments(f, true);
  };

  const handleSubPaymentFilters = (f) => {
    fetchSubPayments(f, true);
  };

  const handleSubPaymentSearch = (search) => {
    const f = { ...subPaymentFilters, search: search || undefined, page: 1 };
    fetchSubPayments(f, true);
  };

  return (
    <PageContainer gradient="slate">
      <h1 className="hidden sm:block text-2xl font-black text-slate-900 mb-6">Transactions</h1>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-5">
          <StatCard
            label="Wallet Credited"
            value={fmtAmount(stats.wallet?.credited?.total)}
            sub={`${stats.wallet?.credited?.count || 0} transactions`}
            icon={ArrowUpCircle}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Wallet Debited"
            value={fmtAmount(stats.wallet?.debited?.total)}
            sub={`${stats.wallet?.debited?.count || 0} transactions`}
            icon={ArrowDownCircle}
            color="bg-rose-50 text-rose-600"
          />
          <StatCard
            label="Online Paid"
            value={fmtAmount(stats.payments?.online_success?.total)}
            sub={`${stats.payments?.online_success?.count || 0} payments`}
            icon={CreditCard}
            color="bg-sky-50 text-sky-600"
          />
          <StatCard
            label="COD Orders"
            value={fmtAmount((stats.payments?.cod_pending?.total || 0) + (stats.payments?.cod_success?.total || 0))}
            sub={`${(stats.payments?.cod_pending?.count || 0) + (stats.payments?.cod_success?.count || 0)} orders`}
            icon={IndianRupee}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Sub. Payments"
            value={fmtAmount((stats.subscriptionPayments?.online?.total || 0) + (stats.subscriptionPayments?.wallet?.total || 0))}
            sub={`${(stats.subscriptionPayments?.online?.count || 0) + (stats.subscriptionPayments?.wallet?.count || 0)} subscriptions`}
            icon={Repeat}
            color="bg-purple-50 text-purple-600"
          />
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="flex bg-white rounded-2xl border border-slate-200 p-1 mb-5 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
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
            {label}
          </button>
        ))}
      </div>

      {/* ── Wallet tab ── */}
      {tab === "wallet" && (
        <>
          <FilterBar
            filters={walletFilters}
            onChange={handleWalletFilters}
            onSearch={handleWalletSearch}
            searchPlaceholder="Search order ID, description..."
            options={[
              {
                key: "type",
                label: "All Types",
                values: [
                  { value: "credit", label: "Credit" },
                  { value: "debit", label: "Debit" },
                ],
              },
              {
                key: "status",
                label: "All Status",
                values: [
                  { value: "success", label: "Success" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ],
              },
            ]}
          />
          <WalletTable transactions={walletTxns} loading={walletLoading} />
          <Pagination
            pagination={walletPagination}
            onPage={(page) => fetchWallet({ ...walletFilters, page }, true)}
          />
        </>
      )}

      {/* ── Payments tab ── */}
      {tab === "payments" && (
        <>
          <FilterBar
            filters={paymentFilters}
            onChange={handlePaymentFilters}
            onSearch={handlePaymentSearch}
            searchPlaceholder="Search order ID, txn ID..."
            options={[
              {
                key: "method",
                label: "All Methods",
                values: [
                  { value: "online", label: "Online" },
                  { value: "wallet", label: "Wallet" },
                  { value: "cod", label: "COD" },
                ],
              },
              {
                key: "paymentStatus",
                label: "All Status",
                values: [
                  { value: "success", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" },
                ],
              },
            ]}
          />
          <PaymentsTable
            payments={payments}
            loading={paymentLoading}
            onOrderClick={(orderId) => navigate(`/orders/${orderId}`)}
          />
          <Pagination
            pagination={paymentPagination}
            onPage={(page) => fetchPayments({ ...paymentFilters, page }, true)}
          />
        </>
      )}

      {/* ── Subscriptions tab ── */}
      {tab === "subscriptions" && (
        <>
          <FilterBar
            filters={subPaymentFilters}
            onChange={handleSubPaymentFilters}
            onSearch={handleSubPaymentSearch}
            searchPlaceholder="Search subscription ID, txn ID..."
            options={[
              {
                key: "method",
                label: "All Methods",
                values: [
                  { value: "online", label: "Online" },
                  { value: "wallet", label: "Wallet" },
                ],
              },
              {
                key: "paymentStatus",
                label: "All Status",
                values: [
                  { value: "success", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" },
                ],
              },
            ]}
          />
          <SubPaymentsTable
            subscriptions={subPayments}
            loading={subPaymentLoading}
            onSubClick={(id) => navigate(`/subscriptions/${id}`)}
          />
          <Pagination
            pagination={subPaymentPagination}
            onPage={(page) => fetchSubPayments({ ...subPaymentFilters, page }, true)}
          />
        </>
      )}
    </PageContainer>
  );
};

export default TransactionsPage;
