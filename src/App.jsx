// src/App.jsx
import {
  HashRouter as BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { UserProvider } from "./modules/user/context/UserContext";
import { ProductProvider } from "./modules/product/context/ProductContext";
import { OrderProvider } from "./modules/order/context/OrderContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/AdminLayout";
import LoginPage from "./modules/auth/pages/LoginPage";
import UsersPage from "./modules/user/pages/UsersPage";
import ProductsPage from "./modules/product/pages/ProductsPage";
import NewProductPage from "./modules/product/pages/NewProductPage";
import EditProductPage from "./modules/product/pages/EditProductPage";
import OrdersPage from "./modules/order/pages/OrdersPage";
import OrderDetailPage from "./modules/order/pages/OrderDetailPage";
import DashboardPage from "./modules/dashboard/pages/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <UserProvider>
                  <ProductProvider>
                    <OrderProvider>
                      <AdminLayout />
                    </OrderProvider>
                  </ProductProvider>
                </UserProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/add" element={<NewProductPage />} />
            <Route
              path="/products/edit/:productId"
              element={<EditProductPage />}
            />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
