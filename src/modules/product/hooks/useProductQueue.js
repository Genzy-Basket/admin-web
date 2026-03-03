// src/modules/product/hooks/useProductQueue.js
import { useState, useCallback } from "react";
import { useProduct } from "../context/ProductContext";
import toast from "react-hot-toast";

export const useProductQueue = () => {
  const [queue, setQueue] = useState([]);
  const { addProduct } = useProduct();

  // Define processTask first using useCallback so it can be used inside other functions
  const processTask = useCallback(
    async (taskId, formData, imageFile) => {
      setQueue((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "processing", message: "Uploading..." }
            : t,
        ),
      );

      try {
        await addProduct(imageFile, formData);

        setQueue((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: "completed", message: "Success!" }
              : t,
          ),
        );
        toast.success(`${formData.name} added to catalog`);
      } catch (err) {
        setQueue((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "error",
                  message: err.message || "Failed",
                }
              : t,
          ),
        );
      }
    },
    [addProduct],
  ); // Dependency on context method

  const addToQueue = useCallback(
    (formData, imageFile) => {
      const taskId = crypto.randomUUID();
      const newTask = {
        id: taskId,
        status: "pending",
        payload: formData,
        imageFile,
        message: "Waiting...",
      };

      setQueue((prev) => [...prev, newTask]);
      processTask(taskId, formData, imageFile);
    },
    [processTask],
  );

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((t) => t.status !== "completed"));
  }, []);

  return { queue, addToQueue, clearCompleted };
};
