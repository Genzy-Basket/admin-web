import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Repeat,
  Search,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Settings,
  X,
} from "lucide-react";
import { useSubscriptions } from "../context/SubscriptionContext";
import { useProduct } from "../../product/context/ProductContext";
import { settingsApi } from "../../../api/endpoints/settings.api";
import { errorBus } from "../../../api/errorBus";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { PageContainer, Badge } from "../../../components/shared";

// ── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: "Active",    variant: "success"   },
  paused:    { label: "Paused",    variant: "warning"   },
  cancelled: { label: "Cancelled", variant: "danger"    },
  completed: { label: "Completed", variant: "secondary" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-black text-slate-800 leading-tight truncate">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ── Subscription Card (mobile) ───────────────────────────────────────────────
const SubscriptionCard = ({ sub, onClick }) => {
  const delivered = sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
  const total = sub.totalDays ?? 0;
  const progress = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold text-[#099E0E]">#{sub.subscriptionId}</span>
          <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
            {sub.userId?.fullName || "—"}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {sub.userId?.phoneNumber || sub.userId?.email || ""}
          </p>
        </div>
        <Badge variant={STATUS_CONFIG[sub.status]?.variant || "secondary"} size="xs">
          {STATUS_CONFIG[sub.status]?.label || sub.status}
        </Badge>
      </div>

      {/* Items summary */}
      <div className="flex flex-wrap gap-1 mb-3">
        {sub.items?.map((item, i) => (
          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {item.productSnapshot?.name} ×{item.quantity}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{delivered}/{total} delivered</span>
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#099E0E] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-800">₹{sub.totalAmount?.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-400">{fmtDate(sub.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

// ── Subscription Products Config ─────────────────────────────────────────────
const SubscriptionProductsConfig = () => {
  const { products, fetchProducts } = useProduct();
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    fetchProducts({}, true);
    settingsApi.get()
      .then((res) => setSelectedIds(res.data?.subscriptionProductIds || []))
      .catch(() => {})
      .finally(() => setConfigLoading(false));
  }, [fetchProducts]);

  const selectedProducts = products.filter((p) => selectedIds.includes(p._id));
  const availableProducts = products.filter((p) => !selectedIds.includes(p._id));

  const handleAdd = (productId) => {
    setSelectedIds((prev) => [...prev, productId]);
    setPickerSearch("");
  };

  const handleRemove = (productId) => {
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({ subscriptionProductIds: selectedIds });
      errorBus.emit("Subscription products updated", "success");
    } catch {
      errorBus.emit("Failed to update subscription products", "error");
    } finally {
      setSaving(false);
    }
  };

  if (configLoading) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Subscription Products</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#099E0E] text-white text-xs font-bold rounded-lg hover:bg-[#078A0C] disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Save
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {selectedProducts.map((p) => (
          <span
            key={p._id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800"
          >
            {p.imageUrl && (
              <img src={p.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />
            )}
            {p.name}
            <button
              onClick={() => handleRemove(p._id)}
              className="ml-1 text-emerald-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selectedProducts.length === 0 && (
          <p className="text-xs text-slate-400">No products selected</p>
        )}
      </div>

      {showPicker ? (
        <div className="border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search products..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {availableProducts
              .filter((p) => {
                if (!pickerSearch) return true;
                const q = pickerSearch.toLowerCase();
                return p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
              })
              .map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleAdd(p._id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                  )}
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{p.category}</span>
                </button>
              ))}
            {availableProducts.filter((p) => {
              if (!pickerSearch) return true;
              const q = pickerSearch.toLowerCase();
              return p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
            }).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">No products found</p>
            )}
          </div>
          <button
            onClick={() => { setShowPicker(false); setPickerSearch(""); }}
            className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="text-xs font-semibold text-[#099E0E] hover:text-[#078A0C] transition-colors"
        >
          + Add product
        </button>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const {
    subscriptions,
    stats,
    pagination,
    loading,
    fetchSubscriptions,
    fetchStats,
    bulkMarkDelivered,
  } = useSubscriptions();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    search: "",
  });

  const [bulking, setBulking] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const clean = useCallback(
    (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")),
    [],
  );

  const handleRefresh = useCallback(async () => {
    await fetchSubscriptions(clean(filters));
    await fetchStats();
  }, [filters, fetchSubscriptions, fetchStats, clean]);

  usePageMeta({ title: "Subscriptions", onRefresh: handleRefresh });

  useEffect(() => {
    fetchSubscriptions(clean(filters));
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    fetchSubscriptions(clean(next));
  };

  const handleStatusFilter = (status) => {
    const next = { ...filters, status, page: 1 };
    setFilters(next);
    fetchSubscriptions(clean(next));
  };

  const handlePage = (newPage) => {
    const next = { ...filters, page: newPage };
    setFilters(next);
    fetchSubscriptions(clean(next));
  };

  const handleBulkDeliver = async () => {
    setBulking(true);
    setBulkResult(null);
    const result = await bulkMarkDelivered();
    setBulking(false);
    setBulkResult(result);
    fetchStats();
    if (result.success) setTimeout(() => setBulkResult(null), 5000);
  };

  const activeCount = stats?.byStatus?.active ?? 0;
  const totalSubs = stats?.totalSubscriptions ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalRefunded = stats?.totalRefunded ?? 0;

  return (
    <PageContainer gradient="slate">
      <h1 className="hidden sm:block text-2xl font-black text-slate-900 mb-6">
        Subscriptions
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total" value={totalSubs} icon={Repeat} color="bg-[#099E0E]" />
        <StatCard label="Active" value={activeCount} sub="Currently running" icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub="All subscriptions" icon={IndianRupee} color="bg-violet-500" />
        <StatCard label="Refunded" value={`₹${totalRefunded.toLocaleString("en-IN")}`} sub="Skips + cancellations" icon={IndianRupee} color="bg-amber-500" />
      </div>

      {/* Subscription products config */}
      <SubscriptionProductsConfig />

      {/* Bulk deliver */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-[#099E0E]" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Daily Delivery</p>
            <p className="text-xs text-[#099E0E] mt-0.5">
              Mark all today's scheduled deliveries as delivered
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          {bulkResult && (
            <p className={`text-xs font-medium flex items-center gap-1 ${bulkResult.success ? "text-emerald-700" : "text-red-600"}`}>
              {bulkResult.success ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {bulkResult.message}
            </p>
          )}
          <button
            onClick={handleBulkDeliver}
            disabled={bulking || activeCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all"
          >
            {bulking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark Today Delivered
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subscription ID…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#099E0E]/30"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#099E0E] text-white text-sm font-semibold rounded-xl hover:bg-[#078A0C] transition-all"
          >
            Search
          </button>
        </form>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter("")}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
              filters.status === ""
                ? "bg-[#099E0E] text-white shadow-sm"
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
                  ? "bg-[#099E0E] text-white shadow-sm"
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

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#099E0E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-500">No subscriptions found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {/* Mobile — cards */}
          <div className="lg:hidden space-y-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                sub={sub}
                onClick={() => navigate(`/subscriptions/${sub._id}`)}
              />
            ))}
          </div>

          {/* Desktop — table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Subscription ID", "Customer", "Items", "Progress", "Total", "Status", "Created"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.map((sub) => {
                  const delivered =
                    sub.deliveryDates?.filter((d) => d.status === "delivered").length ?? 0;
                  const total = sub.totalDays ?? 0;
                  const progress = total > 0 ? Math.round((delivered / total) * 100) : 0;

                  return (
                    <tr
                      key={sub._id}
                      onClick={() => navigate(`/subscriptions/${sub._id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-[#099E0E]">
                          #{sub.subscriptionId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {sub.userId?.fullName || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {sub.userId?.phoneNumber || sub.userId?.email || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {sub.items?.map((item) => item.productSnapshot?.name).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{delivered}/{total}</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#099E0E] rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        ₹{sub.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={STATUS_CONFIG[sub.status]?.variant || "secondary"}
                          size="xs"
                        >
                          {STATUS_CONFIG[sub.status]?.label || sub.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {fmtDate(sub.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-sm text-slate-500">
                Page {pagination.currentPage} of {pagination.totalPages} — {pagination.total} total
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

export default SubscriptionsPage;
