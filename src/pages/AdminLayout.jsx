import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/context/AuthContext";
import { useProduct } from "../modules/product/context/ProductContext";
import { useUsers } from "../modules/user/context/UserContext";
import { Users, Package, FilePlus } from "lucide-react";
import { Header } from "../components/shared/Header";
import { Sidebar } from "../components/shared/Sidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { logout, user } = useAuth();
  const { fetchProducts } = useProduct();
  const { fetchUsers } = useUsers();
  const location = useLocation();

  const navigation = [
    { name: "Users", href: "/users", icon: Users, end: true },
    { name: "Inventory", href: "/products", icon: Package, end: true },
    { name: "Add Product", href: "/products/add", icon: FilePlus, end: true },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (location.pathname.includes("/products"))
        await fetchProducts({}, true);
      else if (location.pathname.includes("/users")) await fetchUsers({}, true);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Section */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-full shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          navigation={navigation}
          user={user}
          logout={logout}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          setIsSidebarOpen={setIsSidebarOpen}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          user={user}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          <div className="p-6 lg:p-10">
            <div className="max-w-7xl mx-auto animate-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

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

export default AdminLayout;
