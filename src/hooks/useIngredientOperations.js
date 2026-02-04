import { useState, useCallback } from "react";
import { ingredientApi } from "../api/ingredientApi";
import { mediaApi } from "../api/mediaApi";
import toast from "react-hot-toast";

/**
 * Custom hook for ingredient operations with image upload
 * Handles the complete workflow: image upload -> ingredient save
 */
export const useIngredientOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Create ingredient with image upload
   * @param {Object} ingredientData - Ingredient data
   * @param {File} imageFile - Image file to upload
   * @param {AbortSignal} signal - Optional abort signal
   * @returns {Promise<Object>} Created ingredient
   */
  const createIngredient = useCallback(
    async (ingredientData, imageFile, signal = null) => {
      setIsProcessing(true);
      setUploadProgress(0);

      try {
        // Step 1: Upload image to Cloudinary with progress tracking
        const imageUrl = await mediaApi.uploadToCloudinary(
          imageFile,
          "food",
          (percent) => setUploadProgress(percent),
          signal,
        );

        // Step 2: Save ingredient to database
        const finalData = {
          ...ingredientData,
          imageUrl,
          priceConfigs: ingredientData.priceConfigs.map((config) => ({
            ...config,
            value: Number(config.value),
            price: Number(config.price),
            mrp: Number(config.mrp),
          })),
        };

        const result = await ingredientApi.add(finalData);
        setUploadProgress(100);

        return result;
      } finally {
        setIsProcessing(false);
        setUploadProgress(0);
      }
    },
    [],
  );

  /**
   * Update ingredient with optional image upload
   * @param {string} id - Ingredient ID
   * @param {Object} ingredientData - Updated ingredient data
   * @param {File} imageFile - Optional new image file
   * @param {AbortSignal} signal - Optional abort signal
   * @returns {Promise<Object>} Updated ingredient
   */
  const updateIngredient = useCallback(
    async (id, ingredientData, imageFile = null, signal = null) => {
      setIsProcessing(true);
      setUploadProgress(0);

      try {
        let imageUrl = ingredientData.imageUrl;

        // Upload new image if provided
        if (imageFile) {
          imageUrl = await mediaApi.uploadToCloudinary(
            imageFile,
            "food",
            (percent) => setUploadProgress(percent),
            signal,
          );
        }

        // Update ingredient
        const finalData = {
          ...ingredientData,
          imageUrl,
          priceConfigs: ingredientData.priceConfigs.map((config) => ({
            ...config,
            value: Number(config.value),
            price: Number(config.price),
            mrp: Number(config.mrp),
          })),
        };

        const result = await ingredientApi.update(id, finalData);
        setUploadProgress(100);

        return result;
      } finally {
        setIsProcessing(false);
        setUploadProgress(0);
      }
    },
    [],
  );

  /**
   * Delete ingredient
   * @param {string} id - Ingredient ID
   * @returns {Promise<void>}
   */
  const deleteIngredient = useCallback(async (id) => {
    setIsProcessing(true);
    try {
      await ingredientApi.delete(id);
      toast.success("Ingredient deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    createIngredient,
    updateIngredient,
    deleteIngredient,
    isProcessing,
    uploadProgress,
  };
};
