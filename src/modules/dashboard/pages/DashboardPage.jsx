import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  Clock,
  Save,
} from "lucide-react";
import { PageContainer } from "../../../components/shared";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { productApi } from "../../../api/endpoints/product.api";
import { settingsApi } from "../../../api/endpoints/settings.api";

// ── Session-level cache — survives navigation, cleared on page refresh ────────
let _cache = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const toTimeValue = (h, m) => `${pad(h)}:${pad(m)}`;
const fromTimeValue = (val) => {
  const [h, m] = val.split(":").map(Number);
  return { hour: h, minute: m };
};
const to12h = (h, m) => {
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${period}`;
};

// ── Reusable feedback line ────────────────────────────────────────────────────
const Feedback = ({ status, message }) => {
  if (!status || status === "loading") return null;
  return (
    <div
      className={`flex items-center gap-2 mt-3 text-sm font-medium ${
        status === "success" ? "text-emerald-700" : "text-red-600"
      }`}
    >
      {status === "success" ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  );
};

// ── Time picker using native <input type="time"> ──────────────────────────────
const TimePicker = ({ label, hour, minute, onChange, hint }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <input
      type="time"
      value={toTimeValue(hour, minute)}
      onChange={(e) => {
        const { hour: h, minute: m } = fromTimeValue(e.target.value);
        onChange(h, m);
      }}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none transition-all"
      required
    />
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheMsg, setCacheMsg] = useState("");

  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [feeStatus, setFeeStatus] = useState(null);
  const [feeMsg, setFeeMsg] = useState("");

  const [openHour, setOpenHour] = useState(8);
  const [openMinute, setOpenMinute] = useState(0);
  const [closeHour, setCloseHour] = useState(23);
  const [closeMinute, setCloseMinute] = useState(0);
  const [deliveryHour, setDeliveryHour] = useState(7);
  const [deliveryMinute, setDeliveryMinute] = useState(30);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [scheduleMsg, setScheduleMsg] = useState("");

  const [settingsLoading, setSettingsLoading] = useState(!_cache);

  const applySettings = useCallback((d) => {
    setDeliveryCharge(d.deliveryCharge ?? 40);
    setFreeThreshold(d.freeDeliveryThreshold ?? 500);
    setOpenHour(d.orderOpenHour ?? 8);
    setOpenMinute(d.orderOpenMinute ?? 0);
    setCloseHour(d.orderCloseHour ?? 23);
    setCloseMinute(d.orderCloseMinute ?? 0);
    setDeliveryHour(d.deliveryByHour ?? 7);
    setDeliveryMinute(d.deliveryByMinute ?? 30);
  }, []);

  const handleRefresh = useCallback(async () => {
    _cache = null;
    setSettingsLoading(true);
    try {
      const res = await settingsApi.get();
      _cache = res.data;
      applySettings(res.data);
    } catch {
      setFeeStatus("error");
      setFeeMsg("Could not load delivery settings");
    } finally {
      setSettingsLoading(false);
    }
  }, [applySettings]);

  usePageMeta({ title: "Dashboard", onRefresh: handleRefresh });

  useEffect(() => {
    // Use cached data if available — skip API call on re-visits
    if (_cache) {
      applySettings(_cache);
      setSettingsLoading(false);
      return;
    }
    settingsApi
      .get()
      .then((res) => {
        _cache = res.data;
        applySettings(res.data);
      })
      .catch(() => {
        setFeeStatus("error");
        setFeeMsg("Could not load delivery settings");
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleBustCache = async () => {
    setCacheStatus("loading");
    setCacheMsg("");
    try {
      const res = await productApi.bustCache();
      setCacheStatus("success");
      setCacheMsg(res.message || "Product cache refreshed");
    } catch (err) {
      setCacheStatus("error");
      setCacheMsg(err?.message || "Failed to refresh product cache");
    }
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    setFeeStatus("loading");
    setFeeMsg("");
    try {
      const res = await settingsApi.update({
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryThreshold: Number(freeThreshold),
      });
      _cache = { ..._cache, ...res.data };
      setDeliveryCharge(res.data.deliveryCharge);
      setFreeThreshold(res.data.freeDeliveryThreshold);
      setFeeStatus("success");
      setFeeMsg("Delivery fee settings saved");
    } catch (err) {
      setFeeStatus("error");
      setFeeMsg(err?.message || "Failed to save fee settings");
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleStatus("loading");
    setScheduleMsg("");
    try {
      const res = await settingsApi.update({
        orderOpenHour: openHour,
        orderOpenMinute: openMinute,
        orderCloseHour: closeHour,
        orderCloseMinute: closeMinute,
        deliveryByHour: deliveryHour,
        deliveryByMinute: deliveryMinute,
      });
      _cache = { ..._cache, ...res.data };
      setOpenHour(res.data.orderOpenHour);
      setOpenMinute(res.data.orderOpenMinute);
      setCloseHour(res.data.orderCloseHour);
      setCloseMinute(res.data.orderCloseMinute);
      setDeliveryHour(res.data.deliveryByHour);
      setDeliveryMinute(res.data.deliveryByMinute);
      setScheduleStatus("success");
      setScheduleMsg("Delivery schedule saved");
    } catch (err) {
      setScheduleStatus("error");
      setScheduleMsg(err?.message || "Failed to save schedule");
    }
  };

  return (
    <PageContainer>
      <div className="hidden sm:flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-7 h-7 text-[#099E0E]" />
        <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
      </div>

      <div className="space-y-4">
        {/* ── Delivery Fee Settings ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Truck className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Delivery Fee
            </h2>
          </div>

          {settingsLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <form onSubmit={handleSaveFee}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Charged when order is below the free delivery threshold.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Free Delivery Above (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Orders at or above this amount get free delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-slate-400">
                  Preview: orders under ₹{freeThreshold} → ₹{deliveryCharge}{" "}
                  charge · orders ≥ ₹{freeThreshold} → free
                </p>
                <button
                  type="submit"
                  disabled={feeStatus === "loading"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all shrink-0"
                >
                  {feeStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
              <Feedback status={feeStatus} message={feeMsg} />
            </form>
          )}
        </div>

        {/* ── Delivery Schedule ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Delivery Schedule
            </h2>
          </div>

          {settingsLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <form onSubmit={handleSaveSchedule}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                <TimePicker
                  label="Order Open Time"
                  hour={openHour}
                  minute={openMinute}
                  onChange={(h, m) => { setOpenHour(h); setOpenMinute(m); }}
                  hint="Checkout opens at this time."
                />
                <TimePicker
                  label="Order Close Time"
                  hour={closeHour}
                  minute={closeMinute}
                  onChange={(h, m) => { setCloseHour(h); setCloseMinute(m); }}
                  hint="Checkout closes at this time."
                />
                <TimePicker
                  label="Delivery By Time"
                  hour={deliveryHour}
                  minute={deliveryMinute}
                  onChange={(h, m) => { setDeliveryHour(h); setDeliveryMinute(m); }}
                  hint="Expected delivery time next morning."
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-slate-400">
                  Preview: ordering open{" "}
                  <span className="font-semibold text-slate-600">
                    {to12h(openHour, openMinute)}
                  </span>
                  {" – "}
                  <span className="font-semibold text-slate-600">
                    {to12h(closeHour, closeMinute)}
                  </span>
                  {" → delivered by "}
                  <span className="font-semibold text-slate-600">
                    {to12h(deliveryHour, deliveryMinute)}
                  </span>{" "}
                  next morning
                </p>
                <button
                  type="submit"
                  disabled={scheduleStatus === "loading"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all shrink-0"
                >
                  {scheduleStatus === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
              <Feedback status={scheduleStatus} message={scheduleMsg} />
            </form>
          )}
        </div>

        {/* ── Backend Controls ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Backend Controls
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Product Cache</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Clears the in-memory product cache. The next request will
                re-fetch all products from the database.
              </p>
            </div>
            <button
              onClick={handleBustCache}
              disabled={cacheStatus === "loading"}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#099E0E] text-white text-sm font-bold rounded-xl hover:bg-[#078A0C] disabled:opacity-50 transition-all shrink-0"
            >
              {cacheStatus === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Products
            </button>
          </div>

          <Feedback status={cacheStatus} message={cacheMsg} />
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
