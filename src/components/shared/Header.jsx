import React from "react";
import { Menu, RefreshCw, Bell } from "lucide-react";

export const Header = ({
  setIsSidebarOpen,
  handleRefresh,
  isRefreshing,
  user,
}) => (
  <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
    <div className="flex items-center gap-4">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-600 lg:hidden hover:bg-slate-100 transition-colors border border-slate-200/50"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-indigo-100 active:scale-95 disabled:opacity-50"
      >
        <RefreshCw
          className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
        />
        <span className="hidden sm:block text-xs sm:text-sm font-bold tracking-tight">
          {isRefreshing ? "Syncing..." : "Refresh Data"}
        </span>
      </button>
    </div>
  </header>
);
