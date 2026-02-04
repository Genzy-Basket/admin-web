import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { IngredientsProvider } from "./context/IngredientsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ViewIngredients from "./pages/ingredients/ViewIngredients";
import IngredientForm from "./pages/ingredients/IngredientUploadForm";
import ManageDish from "./pages/dish/ManageDish";
import CreateDishForm from "./pages/dish/CreateDish";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes - Wrap with IngredientsProvider */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <IngredientsProvider>
                  <AdminLayout />
                </IngredientsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ingredients" element={<ViewIngredients />} />
            <Route path="ingredients/add" element={<IngredientForm />} />
            <Route path="dishes" element={<ManageDish />} />
            <Route path="dishes/add" element={<CreateDishForm />} />
            {/* <Route path="users" element={<ManageUsers />} /> */}
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
