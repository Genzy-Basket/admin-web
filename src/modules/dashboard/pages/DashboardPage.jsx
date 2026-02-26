import { useState } from "react";
import { LayoutDashboard, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PageContainer } from "../../../components/shared";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { productApi } from "../../../api/endpoints/product.api";

const DashboardPage = () => {
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  usePageMeta({ title: "Dashboard" });

  const handleBustCache = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const res = await productApi.bustCache();
      setStatus("success");
      setMessage(res.message || "Product cache refreshed");
    } catch (err) {
      setStatus("error");
      setMessage(
        err?.response?.data?.message || "Failed to refresh product cache",
      );
    }
  };

  return (
    <PageContainer>
      <div className="hidden sm:flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-7 h-7 text-indigo-600" />
        <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
      </div>

      {/* Backend controls section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Backend Controls
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="font-bold text-slate-800">Product Cache</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Clears the in-memory product cache on the server. The next
              request will re-fetch all products from the database.
            </p>
          </div>

          <button
            onClick={handleBustCache}
            disabled={status === "loading"}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Products
          </button>
        </div>

        {/* Feedback */}
        {status && status !== "loading" && (
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
        )}
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
