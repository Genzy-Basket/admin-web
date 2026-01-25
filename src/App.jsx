import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./pages/adminLayout";
import ManageUsers from "./pages/manage_users";
import CreateDishForm from "./pages/CreateDish";
import ManageDish from "./pages/ManageDish";
import { IngredientsProvider } from "./context/IngredientsContext";
import ViewIngredients from "./pages/Ingrents/view_ingredients";
import IngredientForm from "./pages/Ingrents/Ingredient_upload_form";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<div>Dashboard Stats Page</div>} />
          <Route
            path="ingredients"
            element={
              <IngredientsProvider>
                <ViewIngredients />
              </IngredientsProvider>
            }
          />
          <Route path="ingredients/add" element={<IngredientForm />} />
          <Route path="dishes" element={<ManageDish />} />
          <Route
            path="dishes/add"
            element={
              <IngredientsProvider>
                <CreateDishForm />
              </IngredientsProvider>
            }
          />
          <Route path="manage-users" element={<ManageUsers />} />
          {/* Add more feature routes here */}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
