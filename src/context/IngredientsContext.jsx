import { createContext, useContext, useState, useCallback } from "react";
import { ingredientApi } from "../api/ingredientApi";
import { mediaApi } from "../api/mediaApi";

const IngredientsContext = createContext(null);

export const IngredientsProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all ingredients from the backend
   * Backend returns: { status: "success", results: number, data: [...] }
   */
  const fetchIngredients = useCallback(async () => {
    // Only fetch if we have a token
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    if (!token && !adminToken) {
      setIngredients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ingredientApi.getAll();

      // ✅ Backend returns: { status: "success", results: 100, data: [...] }
      // Extract the data array from response
      const data = response.data || [];

      setIngredients(data);
    } catch (err) {
      // Don't set error for 401 - user is likely not logged in
      if (err.response?.status !== 401) {
        setError("Failed to fetch ingredients");
        console.error("Fetch ingredients error:", err);
      }
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new ingredient (Admin only)
   * Uploads image to Cloudinary first, then creates ingredient
   */
  const addNewIngredient = async (file, itemData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Upload image to Cloudinary if file exists
      let imageUrl = "";
      if (file) {
        imageUrl = await mediaApi.uploadToCloudinary(file);
      }

      // 2. Prepare ingredient payload
      const payload = {
        name: itemData.name,
        imageUrl: imageUrl,
        keywords: itemData.keywords || [],
        category: itemData.category,
        isVeg: itemData.isVeg !== undefined ? itemData.isVeg : true,
        available: itemData.available !== undefined ? itemData.available : true,
        priceConfigs: itemData.priceConfigs || [],
      };

      // 3. Create ingredient via API
      const response = await ingredientApi.add(payload);

      // ✅ Backend returns: { status: "success", data: {...} }
      const savedItem = response.data;

      // 4. Update local state
      setIngredients((prev) => [...prev, savedItem]);

      return savedItem;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save ingredient";
      setError(errorMessage);
      console.error("Add ingredient error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing ingredient (Admin only)
   */
  const updateIngredient = async (id, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ingredientApi.update(id, updateData);

      // ✅ Backend returns: { status: "success", data: {...} }
      const updatedItem = response.data;

      // Update local state
      setIngredients((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item)),
      );

      return updatedItem;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update ingredient";
      setError(errorMessage);
      console.error("Update ingredient error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update ingredient with new image (Admin only)
   */
  const updateIngredientWithImage = async (id, file, updateData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Upload new image to Cloudinary if file exists
      let imageUrl = updateData.imageUrl; // Keep existing if no new file
      if (file) {
        imageUrl = await mediaApi.uploadToCloudinary(file);
      }

      // 2. Prepare update payload
      const payload = {
        ...updateData,
        imageUrl: imageUrl,
      };

      // 3. Update ingredient via API
      const response = await ingredientApi.update(id, payload);

      // ✅ Backend returns: { status: "success", data: {...} }
      const updatedItem = response.data;

      // 4. Update local state
      setIngredients((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item)),
      );

      return updatedItem;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update ingredient";
      setError(errorMessage);
      console.error("Update ingredient with image error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an ingredient (Admin only)
   */
  const deleteIngredient = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await ingredientApi.delete(id);

      // ✅ Backend returns: 204 No Content (no response data)

      // Remove from local state
      setIngredients((prev) => prev.filter((item) => item._id !== id));

      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete ingredient";
      setError(errorMessage);
      console.error("Delete ingredient error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Client-side search (no backend call)
   * Search in name, category, and keywords
   */
  const searchIngredients = useCallback(
    (searchTerm) => {
      if (!searchTerm || searchTerm.trim() === "") {
        return ingredients;
      }

      const term = searchTerm.toLowerCase().trim();

      return ingredients.filter((ingredient) => {
        // Search in name
        if (ingredient.name.toLowerCase().includes(term)) return true;

        // Search in category
        if (ingredient.category.toLowerCase().includes(term)) return true;

        // Search in keywords
        if (
          ingredient.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(term),
          )
        ) {
          return true;
        }

        return false;
      });
    },
    [ingredients],
  );

  /**
   * Client-side filter (no backend call)
   */
  const filterIngredients = useCallback(
    ({ category, isVeg, available }) => {
      return ingredients.filter((ingredient) => {
        // Filter by category
        if (category && ingredient.category !== category) return false;

        // Filter by veg/non-veg
        if (isVeg !== undefined && ingredient.isVeg !== isVeg) return false;

        // Filter by availability
        if (available !== undefined && ingredient.available !== available)
          return false;

        return true;
      });
    },
    [ingredients],
  );

  const value = {
    // State
    ingredients,
    loading,
    error,

    // Actions
    refreshIngredients: fetchIngredients,
    addNewIngredient,
    updateIngredient,
    updateIngredientWithImage,
    deleteIngredient,

    // Client-side operations
    searchIngredients,
    filterIngredients,
  };

  return (
    <IngredientsContext.Provider value={value}>
      {children}
    </IngredientsContext.Provider>
  );
};

export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error("useIngredients must be used within IngredientsProvider");
  }
  return context;
};
