import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { adminRoutes } from "../routes/adminRoutes";

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">
            INGRE ADMIN
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminRoutes.map((route) => {
            // Check if current path matches the route path exactly
            const isActive = location.pathname === route.path;

            return (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {route.icon}
                {route.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
          <p className="text-sm font-medium text-slate-400">
            Welcome back, Admin
          </p>
        </header>
        <div className="p-0">
          <Outlet /> {/* This is where the specific page components render */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
