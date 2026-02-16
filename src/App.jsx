// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { UserProvider } from "./modules/user/context/UserContext";
import { ProductProvider } from "./modules/product/context/ProductContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/AdminLayout";
import LoginPage from "./modules/auth/pages/LoginPage";
import UsersPage from "./modules/user/pages/UsersPage";
import ProductsPage from "./modules/product/pages/ProductsPage";
import NewProductPage from "./modules/product/pages/NewProductPage";
import EditProductPage from "./modules/product/pages/EditProductPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <UserProvider>
                  <ProductProvider>
                    <AdminLayout />
                  </ProductProvider>
                </UserProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<UsersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/add" element={<NewProductPage />} />
            <Route
              path="/products/edit/:productId"
              element={<EditProductPage />}
            />

            <Route path="/" element={<Navigate to="/users" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
