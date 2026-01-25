import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAllIngredients,
  addIngredient,
  uploadToCloudinary,
} from "../api/axiosClient"; // Adjust path

const IngredientsContext = createContext();

export const IngredientsProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load ingre	dients globally on mount
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await getAllIngredients();

      const actualData = Array.isArray(response)
        ? response
        : response.data || [];

      setIngredients(actualData);
    } catch (err) {
      setError("Failed to fetch ingredients");
      setIngredients([]); // Fallback to empty array so .map doesn't crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  /**
   * Complex action: Handles Image Upload + Data Save
   * @param {File} file - The image file from input
   * @param {Object} itemData - The vegetable object (name, unit, etc)
   * @param {String} type - 'main' or 'optional'
   */
  const addNewIngredient = async (file, itemData, type) => {
    setLoading(true);
    try {
      // 1. Upload to Cloudinary first
      const imageUrl = await uploadToCloudinary(file);

      // 2. Prepare payload for your backend
      const payload = {
        ...itemData,
        imageUrl,
        ingredientType: type, // 'main' or 'optional'
      };

      // 3. Save to database
      const savedItem = await addIngredient(payload);

      // 4. Update global state so UI updates immediately
      setIngredients((prev) => [...prev, savedItem]);
      return savedItem;
    } catch (err) {
      setError("Failed to save ingredient");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <IngredientsContext.Provider
      value={{
        ingredients,
        loading,
        error,
        refreshIngredients: fetchIngredients,
        addNewIngredient,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
};

// Custom hook for easy access
export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error(
      "useIngredients must be used within an IngredientsProvider",
    );
  }
  return context;
};
