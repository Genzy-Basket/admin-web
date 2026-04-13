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

  // Upload progress: { step: "Uploading dish image 1/3", progress: 45, total: 7, current: 1 }
  const [uploadStatus, setUploadStatus] = useState(null);

  /**
   * Upload images with progress tracking
   */
  async function resolveImages(images, label, startIdx, totalSteps) {
    const urls = [];
    let fileCount = 0;
    const newFiles = images.filter((img) => img.file);
    for (const img of images) {
      if (img.file) {
        fileCount++;
        const stepLabel = `Uploading ${label} ${fileCount}/${newFiles.length}`;
        setUploadStatus({ step: stepLabel, progress: 0, current: startIdx + fileCount, total: totalSteps });
        const url = await mediaApi.uploadToCloudinary(img.file, "dish_images", (pct) => {
          setUploadStatus((prev) => prev ? { ...prev, progress: pct } : null);
        });
        urls.push(url);
      } else {
        urls.push(img.url);
      }
    }
    return { urls, uploadCount: fileCount };
  }

  /**
   * Count total upload steps for progress display
   */
  function countSteps(dishData) {
    let steps = 0;
    for (const img of dishData.dishImages || []) if (img.file) steps++;
    if (dishData.videoFile) steps++;
    for (const img of dishData.instructionImages || []) if (img.file) steps++;
    steps++; // saving to DB
    return steps;
  }

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

  const createDish = async (dishData) => {
    setLoading(true);
    const totalSteps = countSteps(dishData);
    let stepIdx = 0;

    try {
      // Dish images
      const dishImgResult = await resolveImages(
        dishData.dishImages || [], "dish image", stepIdx, totalSteps,
      );
      const dishImages = dishImgResult.urls;
      stepIdx += dishImgResult.uploadCount;

      // Video
      let videoUrl = dishData.videoUrl || undefined;
      if (dishData.videoFile) {
        stepIdx++;
        setUploadStatus({ step: "Uploading video", progress: 0, current: stepIdx, total: totalSteps });
        videoUrl = await mediaApi.uploadVideoToCloudinary(dishData.videoFile, "dish_videos", (pct) => {
          setUploadStatus((prev) => prev ? { ...prev, progress: pct } : null);
        });
      }

      // Instruction images
      const instrImgResult = await resolveImages(
        dishData.instructionImages || [], "instruction image", stepIdx, totalSteps,
      );
      const instructionImages = instrImgResult.urls;
      stepIdx += instrImgResult.uploadCount;

      // Save
      setUploadStatus({ step: "Saving dish...", progress: 100, current: totalSteps, total: totalSteps });
      const { dishImages: _a, instructionImages: _b, videoFile: _c, ...rest } = dishData;
      const response = await dishApi.create({ ...rest, dishImages, instructionImages, videoUrl });
      setDishes((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = err.message || "Failed to create dish";
      setError(message);
      errorBus.emit(message, "error");
      throw err;
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  };

  const updateDish = async (id, dishData) => {
    setLoading(true);
    const totalSteps = countSteps(dishData);
    let stepIdx = 0;

    try {
      const dishImgResult = await resolveImages(
        dishData.dishImages || [], "dish image", stepIdx, totalSteps,
      );
      const dishImages = dishImgResult.urls;
      stepIdx += dishImgResult.uploadCount;

      let videoUrl = dishData.videoUrl || undefined;
      if (dishData.videoFile) {
        stepIdx++;
        setUploadStatus({ step: "Uploading video", progress: 0, current: stepIdx, total: totalSteps });
        videoUrl = await mediaApi.uploadVideoToCloudinary(dishData.videoFile, "dish_videos", (pct) => {
          setUploadStatus((prev) => prev ? { ...prev, progress: pct } : null);
        });
      }

      const instrImgResult = await resolveImages(
        dishData.instructionImages || [], "instruction image", stepIdx, totalSteps,
      );
      const instructionImages = instrImgResult.urls;
      stepIdx += instrImgResult.uploadCount;

      setUploadStatus({ step: "Saving dish...", progress: 100, current: totalSteps, total: totalSteps });
      const { dishImages: _a, instructionImages: _b, videoFile: _c, ...rest } = dishData;
      const response = await dishApi.update(id, { ...rest, dishImages, instructionImages, videoUrl });
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
      setUploadStatus(null);
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
        uploadStatus,
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
