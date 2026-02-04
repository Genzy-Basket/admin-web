import { createContext, useContext, useState, useCallback } from "react";
import { ingredientApi } from "../api/ingredientApi";
import { mediaApi } from "../api/mediaApi";

const IngredientsContext = createContext(null);

export const IngredientsProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIngredients = useCallback(async () => {
    // Only fetch if we have a token
    const token = localStorage.getItem("token");
    if (!token) {
      setIngredients([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ingredientApi.getAll();
      const data = Array.isArray(response) ? response : response.data || [];
      setIngredients(data);
    } catch (err) {
      // Don't set error for 401 - user is likely not logged in
      if (err.response?.status !== 401) {
        setError("Failed to fetch ingredients");
      }
      console.error(err);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Don't auto-fetch on mount - let components fetch when needed

  const addNewIngredient = async (file, itemData, type) => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await mediaApi.uploadToCloudinary(file);
      }

      const payload = {
        ...itemData,
        imageUrl,
        ingredientType: type,
      };

      const savedItem = await ingredientApi.add(payload);
      setIngredients((prev) => [...prev, savedItem]);
      return savedItem;
    } catch (err) {
      setError(err.message || "Failed to save ingredient");
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

export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error("useIngredients must be used within IngredientsProvider");
  }
  return context;
};
