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
import UpdateIngredient from "./pages/ingredients/UpdateIngredientPage";

function App() {
  return (
    <AuthProvider>
      {/* 1. Basename is great, but ensure your redirects use relative paths if needed */}
      <BrowserRouter basename="/admin">
        <Routes>
          {/* Public Routes */}
          <Route path="login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
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
            {/* 2. Use 'index' for the default view without a heavy redirect if possible, 
               or ensure the path is absolute within the router context */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ingredients" element={<ViewIngredients />} />
            <Route
              path="/ingredients/update/:id"
              element={<UpdateIngredient />}
            />
            <Route path="ingredients/add" element={<IngredientForm />} />
            <Route path="dishes" element={<ManageDish />} />
            <Route path="dishes/add" element={<CreateDishForm />} />
          </Route>

          {/* 3. Global Catch-all: Only one redirect at the bottom */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
