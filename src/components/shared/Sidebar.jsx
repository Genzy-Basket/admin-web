import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Leaf, LogOut, ChevronDown } from "lucide-react";

const NavItem = ({ item, setIsSidebarOpen }) => (
  <NavLink
    to={item.href}
    end={item.end}
    onClick={() => setIsSidebarOpen(false)}
    className={({ isActive }) =>
      `group flex items-center justify-between px-4 py-2.5 text-sm font-bold rounded-2xl transition-all duration-200 ${
        isActive
          ? "bg-[#099E0E] text-white shadow-lg shadow-[#099E0E]/20"
          : "text-slate-500 hover:bg-emerald-50 hover:text-[#099E0E]"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <item.icon
            className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? "text-white" : "text-slate-400 group-hover:text-[#099E0E]"
            }`}
          />
          {item.name}
        </div>
        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
        )}
      </>
    )}
  </NavLink>
);

const NavGroup = ({ group, setIsSidebarOpen }) => {
  const location = useLocation();
  const hasActiveChild = group.children.some((child) =>
    location.pathname.startsWith(child.href),
  );
  const [open, setOpen] = useState(hasActiveChild);

  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 ${
          hasActiveChild
            ? "text-[#099E0E] bg-emerald-50"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-5 h-5 ${
              hasActiveChild ? "text-[#099E0E]" : "text-slate-400"
            }`}
          />
          {group.name}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="ml-4 pl-3 mt-1 space-y-0.5 border-l-2 border-slate-200">
          {group.children.map((child) => (
            <NavItem
              key={child.name}
              item={child}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ navigation, user, logout, setIsSidebarOpen }) => (
  <div className="h-full flex flex-col border-r border-slate-200/60">
    {/* Logo */}
    <div className="h-20 flex items-center px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#099E0E] rounded-xl flex items-center justify-center shadow-md shadow-[#099E0E]/30">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
          Genzy Basket<span className="text-[#099E0E]">.</span>
        </span>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
      <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        Management
      </p>
      {navigation.map((item) =>
        item.children ? (
          <NavGroup
            key={item.name}
            group={item}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ) : (
          <NavItem
            key={item.name}
            item={item}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        ),
      )}
    </nav>

    {/* User Card */}
    <div className="p-4 mx-4 mb-6 bg-emerald-50 rounded-3xl border border-emerald-100">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 rounded-2xl bg-[#099E0E] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#099E0E]/20">
          {user?.fullName?.charAt(0) || "A"}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-slate-800 truncate leading-tight">
            {user?.fullName || "Admin User"}
          </p>
          <p className="text-[11px] font-medium text-[#099E0E] uppercase tracking-wider">
            Super Admin
          </p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-bold text-rose-500 bg-white border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-200 group"
      >
        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Sign Out
      </button>
    </div>
  </div>
);
