import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { ingredientApi } from "../api/ingredientApi";
import { mediaApi } from "../api/mediaApi";

const MAX_QUEUE_SIZE = 50;

/**
 * Custom hook for managing ingredient queue processing
 */
export const useIngredientQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const abortControllerRef = useRef(null);

  // Queue processing effect
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing) return;

      const task = queue.find((item) => item.status === "pending");
      if (!task) return;

      setIsProcessing(true);
      abortControllerRef.current = new AbortController();

      updateTask(task.id, {
        status: "processing",
        message: "Uploading Image...",
      });

      try {
        // Step 1: Upload image with progress tracking
        const imageUrl = await mediaApi.uploadToCloudinary(
          task.file,
          "food",
          (percent) => {
            setUploadProgress((prev) => ({ ...prev, [task.id]: percent }));
            updateTask(task.id, {
              message: `Uploading Image... ${percent}%`,
            });
          },
          abortControllerRef.current.signal,
        );

        // Step 2: Save to database
        updateTask(task.id, { message: "Saving to Database..." });

        const finalData = {
          ...task.payload,
          imageUrl,
          priceConfigs: task.payload.priceConfigs.map((config) => ({
            ...config,
            value: Number(config.value),
            price: Number(config.price),
            mrp: Number(config.mrp),
          })),
        };

        await ingredientApi.add(finalData);

        updateTask(task.id, {
          status: "completed",
          message: "Successfully Synchronized",
        });

        toast.success(`Success: ${task.payload.name} added.`);

        // Clear the file reference after successful upload
        updateTask(task.id, { file: null });
      } catch (err) {
        const isAborted =
          err.name === "AbortError" || err.name === "CanceledError";

        updateTask(task.id, {
          status: "error",
          message: isAborted
            ? "Upload cancelled"
            : `Error: ${err.response?.data?.message || err.message || "Connection failed"}`,
        });

        if (!isAborted) {
          toast.error(`Failed: ${task.payload.name}`);
        }
      } finally {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[task.id];
          return newProgress;
        });
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    };

    processQueue();
  }, [queue, isProcessing]);

  // Update task helper
  const updateTask = useCallback((id, updates) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  // Add to queue
  const addToQueue = useCallback(
    (ingredientData, imageFile) => {
      if (queue.length >= MAX_QUEUE_SIZE) {
        toast.error(`Queue is full (max ${MAX_QUEUE_SIZE} items)`);
        return false;
      }

      if (!imageFile) {
        toast.error("Please select an image!");
        return false;
      }

      // Validate price configs
      const validConfigs = ingredientData.priceConfigs.filter(
        (config) => config.value && config.price && config.mrp,
      );

      if (validConfigs.length === 0) {
        toast.error("Please add at least one complete price configuration!");
        return false;
      }

      setQueue((prev) => [
        ...prev,
        {
          id: Date.now(),
          status: "pending",
          message: "Queued",
          file: imageFile,
          payload: {
            ...ingredientData,
            priceConfigs: validConfigs,
          },
        },
      ]);

      toast.success("Added to queue!");
      return true;
    },
    [queue.length],
  );

  // Retry task
  const retryTask = useCallback((task) => {
    return {
      formData: task.payload,
      imageFile: task.file,
    };
  }, []);

  // Remove task
  const removeTask = useCallback((taskId) => {
    setQueue((prev) => prev.filter((item) => item.id !== taskId));
  }, []);

  // Clear completed
  const clearCompleted = useCallback(() => {
    const completedCount = queue.filter((t) => t.status === "completed").length;
    if (completedCount === 0) {
      toast.error("No completed tasks to clear");
      return;
    }

    if (window.confirm(`Clear ${completedCount} completed task(s)?`)) {
      setQueue((q) => q.filter((t) => t.status !== "completed"));
      toast.success(`Cleared ${completedCount} completed tasks`);
    }
  }, [queue]);

  // Cancel current processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Sorted queue
  const priorityMap = useMemo(
    () => ({ error: 0, processing: 1, pending: 2, completed: 3 }),
    [],
  );

  const sortedQueue = useMemo(() => {
    return [...queue].sort(
      (a, b) => priorityMap[a.status] - priorityMap[b.status],
    );
  }, [queue, priorityMap]);

  // Queue stats
  const queueStats = useMemo(() => {
    return queue.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      { pending: 0, processing: 0, completed: 0, error: 0 },
    );
  }, [queue]);

  return {
    queue: sortedQueue,
    queueStats,
    uploadProgress,
    isProcessing,
    addToQueue,
    retryTask,
    removeTask,
    clearCompleted,
    cancelProcessing,
    maxQueueSize: MAX_QUEUE_SIZE,
  };
};
