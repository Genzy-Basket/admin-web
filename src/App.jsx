// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { ProductProvider } from "./modules/product/context/ProductContext";
import { DishProvider } from "./modules/dish/context/DishContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/AdminLayout";
import LoginPage from "./modules/auth/pages/LoginPage";
import ProductsPage from "./modules/product/pages/ProductsPage";
import ProductFormPage from "./modules/product/pages/ProductFormPage";
import DishesPage from "./modules/dish/pages/DishesPage";
import NewDishPage from "./modules/dish/pages/NewDishPage";
import EditDishPage from "./modules/dish/pages/EditDishPage";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <ProductProvider>
                    <DishProvider>
                      <AdminLayout />
                    </DishProvider>
                  </ProductProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/add" element={<ProductFormPage />} />
              <Route
                path="/products/edit/:productId"
                element={<ProductFormPage />}
              />
              <Route path="/dishes" element={<DishesPage />} />
              <Route path="/dishes/add" element={<NewDishPage />} />
              <Route path="/dishes/edit/:dishId" element={<EditDishPage />} />

              <Route path="/" element={<Navigate to="/products" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
