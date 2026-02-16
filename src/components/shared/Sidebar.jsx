import React from "react";
import { NavLink } from "react-router-dom";
import { Package, LogOut } from "lucide-react";

export const Sidebar = ({ navigation, user, logout, setIsSidebarOpen }) => (
  <div className="h-full flex flex-col border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
    {/* Logo Section */}
    <div className="h-20 flex items-center px-8 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Package className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 uppercase">
          FoodAdmin<span className="text-indigo-600">.</span>
        </span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
      <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        Management
      </p>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          end={item.end}
          onClick={() => setIsSidebarOpen(false)}
          className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200
            ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }
          `}
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}
                />
                {item.name}
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* User Profile Card */}
    <div className="p-4 mx-4 mb-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold border border-slate-200/60 ring-2 ring-indigo-50">
          {user?.fullName?.charAt(0) || "A"}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">
            {user?.fullName || "Admin User"}
          </p>
          <p className="text-[11px] font-medium text-indigo-500 uppercase tracking-wider">
            Super Admin
          </p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-bold text-rose-500 bg-white border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-200 shadow-sm group"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Sign Out
      </button>
    </div>
  </div>
);
