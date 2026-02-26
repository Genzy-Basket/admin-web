import { useState } from "react";
import { Menu, RefreshCw, Bell } from "lucide-react";
import { usePageHeader } from "../../context/PageHeaderContext";

export const Header = ({ setIsSidebarOpen }) => {
  const { title, hasRefresh, callRefresh } = usePageHeader();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await callRefresh();
    } catch {
      /* pages handle their own errors */
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-10 shrink-0 sticky top-0 z-30">
      {/* Left — menu button + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 lg:hidden hover:bg-slate-100 transition-colors border border-slate-200/50 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h2 className="text-base font-bold text-slate-800 truncate">
            {title}
          </h2>
        )}
      </div>

      {/* Right — bell + conditional refresh */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>

        {hasRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-indigo-100 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }`}
            />
            <span className="hidden sm:block text-xs font-bold tracking-tight">
              {refreshing ? "Syncing…" : "Refresh"}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
