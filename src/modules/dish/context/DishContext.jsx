// src/modules/dish/context/DishContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { dishApi } from "../../../api/endpoints/dish.api";
import { mediaApi } from "../../../api/endpoints/media.api";
import { errorBus } from "../../../api/errorBus";

const DishContext = createContext(null);

export const DishProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDishes = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await dishApi.getAll(filters);
      setDishes(response.data || []);
    } catch (err) {
      const message = err.message || "Failed to fetch dishes";
      setError(message);
      errorBus.emit(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const getDishById = useCallback(
    async (id) => {
      const local = dishes.find((d) => d._id === id);
      if (local) return local;

      setLoading(true);
      try {
        const response = await dishApi.getById(id);
        return response.data;
      } finally {
        setLoading(false);
      }
    },
    [dishes],
  );

  const createDish = async (file, dishData) => {
    setLoading(true);
    try {
      let imageUrl = dishData.imageUrl;
      if (file) imageUrl = await mediaApi.uploadToCloudinary(file, "dishes");

      const response = await dishApi.create({ ...dishData, imageUrl });
      setDishes((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = err.message || "Failed to create dish";
      setError(message);
      errorBus.emit(message, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDish = async (id, updateData, file = null) => {
    setLoading(true);
    try {
      let imageUrl = updateData.imageUrl;
      if (file) imageUrl = await mediaApi.uploadToCloudinary(file, "dishes");

      const response = await dishApi.update(id, { ...updateData, imageUrl });
      setDishes((prev) =>
        prev.map((d) => (d._id === id ? response.data : d)),
      );
      return response.data;
    } catch (err) {
      const message = err.message || "Failed to update dish";
      setError(message);
      errorBus.emit(message, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDish = async (id) => {
    setLoading(true);
    try {
      await dishApi.delete(id);
      setDishes((prev) => prev.filter((d) => d._id !== id));
      return true;
    } catch (err) {
      const message = err.message || "Failed to delete dish";
      setError(message);
      errorBus.emit(message, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DishContext.Provider
      value={{
        dishes,
        loading,
        error,
        fetchDishes,
        getDishById,
        createDish,
        updateDish,
        deleteDish,
      }}
    >
      {children}
    </DishContext.Provider>
  );
};

export const useDish = () => useContext(DishContext);
