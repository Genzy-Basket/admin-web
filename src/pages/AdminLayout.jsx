import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../modules/auth/context/AuthContext";
import { Users, Package, FilePlus, ShoppingBag, LayoutDashboard, PackageCheck, Bell, Repeat } from "lucide-react";
import { Header } from "../components/shared/Header";
import { Sidebar } from "../components/shared/Sidebar";
import { PageHeaderProvider, usePageHeader } from "../context/PageHeaderContext";

// ── Scroll-aware FAB (mobile only) ────────────────────────────────────────────
const FAB = () => {
  const { fab, mainRef } = usePageHeader();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handler = () => {
      const y = el.scrollTop;
      if (y < 80) {
        setVisible(true);
      } else {
        setVisible(y < lastScrollY.current);
      }
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [mainRef]);

  useEffect(() => {
    setVisible(true);
    lastScrollY.current = 0;
  }, [fab]);

  if (!fab) return null;
  const Icon = fab.icon;

  return (
    <button
      onClick={fab.onClick}
      className={`fixed bottom-6 right-6 z-40 lg:hidden flex items-center gap-2 px-4 py-3.5 bg-[#099E0E] text-white rounded-2xl shadow-lg shadow-[#099E0E]/30 font-bold text-sm transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <Icon className="w-5 h-5" />
      {fab.label}
    </button>
  );
};

// ── Inner layout ──────────────────────────────────────────────────────────────
const LayoutInner = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { mainRef } = usePageHeader();

  const navigation = [
    { name: "Dashboard",   href: "/dashboard",    icon: LayoutDashboard, end: true },
    { name: "Users",       href: "/users",        icon: Users,           end: true },
    { name: "Inventory",   href: "/products",     icon: Package,         end: true },
    { name: "Add Product", href: "/products/add", icon: FilePlus,        end: true },
    { name: "Orders",      href: "/orders",       icon: ShoppingBag,     end: true },
    { name: "Packing",     href: "/packing",      icon: PackageCheck,    end: true },
    { name: "Subscriptions", href: "/subscriptions",  icon: Repeat,       end: true },
    { name: "Notifications", href: "/notifications", icon: Bell,         end: true },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-sans text-slate-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-full shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          navigation={navigation}
          user={user}
          logout={logout}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar"
        >
          <div className="p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10">
            <div className="max-w-7xl mx-auto animate-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <FAB />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slideIn 0.4s ease-out forwards; }
      `,
        }}
      />
    </div>
  );
};

const AdminLayout = () => (
  <PageHeaderProvider>
    <LayoutInner />
  </PageHeaderProvider>
);

export default AdminLayout;
