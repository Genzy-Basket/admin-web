import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { LayoutGrid, FileJson, Database } from "lucide-react";
import { categories, units } from "../../config/constants";
import { mediaApi } from "../../api/mediaApi";

// Shared Components
import {
  Card,
  Button,
  FormInput,
  FormSelect,
  SectionHeader,
  EmptyState,
  StatusIndicator,
  ProgressBar,
  MediaPicker,
} from "../../components/shared";

const IngredientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "gram",
    pricePerUnit: "",
    category: "vegetables",
    isVeg: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rawJson, setRawJson] = useState("");
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const abortControllerRef = useRef(null);
  const MAX_QUEUE_SIZE = 50;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing) return;
      const task = queue.find((item) => item.status === "pending");
      if (!task) return;

      setIsProcessing(true);
      abortControllerRef.current = new AbortController();

      updateTask(task.id, {
        status: "processing",
        message: "Step 1/2: Uploading Image...",
      });

      try {
        const { timestamp, signature, apiKey, cloudName, folder } =
          await mediaApi.getSignature("food");

        const data = new FormData();
        data.append("file", task.file);
        data.append("api_key", apiKey);
        data.append("timestamp", timestamp);
        data.append("signature", signature);
        data.append("folder", folder);

        const imgRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          data,
          {
            signal: abortControllerRef.current.signal,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress((prev) => ({
                ...prev,
                [task.id]: percentCompleted,
              }));
              updateTask(task.id, {
                message: `Step 1/2: Uploading Image... ${percentCompleted}%`,
              });
            },
          },
        );
        const imageUrl = imgRes.data.secure_url;

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[task.id];
          return newProgress;
        });

        updateTask(task.id, { message: "Step 2/2: Saving to Database..." });

        const finalData = {
          ...task.payload,
          imageUrl,
          pricePerUnit: Number(task.payload.pricePerUnit),
        };

        await axios.post(`${API_URL}/ingredient`, finalData, {
          signal: abortControllerRef.current.signal,
        });

        updateTask(task.id, {
          status: "completed",
          message: "Successfully Synchronized",
        });

        toast.success(`Success: ${task.payload.name} added.`);
        updateTask(task.id, { file: null });
      } catch (err) {
        if (err.name === "AbortError") {
          updateTask(task.id, {
            status: "error",
            message: "Upload cancelled",
          });
        } else {
          const serverErrorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Connection failed";

          updateTask(task.id, {
            status: "error",
            message: `Error: ${serverErrorMessage}`,
          });
          toast.error(`Failed: ${task.payload.name}`);
        }

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[task.id];
          return newProgress;
        });
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    };

    processQueue();
  }, [queue, isProcessing, API_URL]);

  const updateTask = useCallback((id, updates) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  const priorityMap = { error: 0, processing: 1, pending: 2, completed: 3 };
  const sortedQueue = useMemo(() => {
    return [...queue].sort(
      (a, b) => priorityMap[a.status] - priorityMap[b.status],
    );
  }, [queue]);

  const handleJsonPaste = useCallback((e) => {
    const value = e.target.value;
    setRawJson(value);

    try {
      let cleaned = value.trim();
      if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);

      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === "object") {
        setFormData({
          name: parsed.name || "",
          unit: units.includes(parsed.unit?.toLowerCase())
            ? parsed.unit.toLowerCase()
            : "gram",
          pricePerUnit: parsed.pricePerUnit || parsed.pricePerQty || "",
          category: categories.includes(parsed.category?.toLowerCase())
            ? parsed.category.toLowerCase()
            : "vegetables",
          isVeg: parsed.isVeg !== undefined ? parsed.isVeg : true,
        });
      }
    } catch (err) {
      if (value.trim() && value.includes("{")) {
        console.warn("Invalid JSON format:", err);
      }
    }
  }, []);

  const handleImageChange = useCallback(
    (file) => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [imagePreview],
  );

  const removeImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }, [imagePreview]);

  const addToQueue = useCallback(
    (e) => {
      e.preventDefault();

      if (!imageFile) {
        toast.error("Please select an image!");
        return;
      }

      if (queue.length >= MAX_QUEUE_SIZE) {
        toast.error(`Queue is full (max ${MAX_QUEUE_SIZE} items)`);
        return;
      }

      setQueue((prev) => [
        ...prev,
        {
          id: Date.now(),
          status: "pending",
          message: "Queued",
          file: imageFile,
          payload: { ...formData },
        },
      ]);

      setFormData({
        name: "",
        unit: "gram",
        pricePerUnit: "",
        category: "vegetables",
        isVeg: true,
      });

      removeImage();
      setRawJson("");
    },
    [imageFile, queue.length, formData, removeImage],
  );

  const handleRetry = useCallback((task) => {
    setFormData(task.payload);
    if (task.file) {
      setImageFile(task.file);
      setImagePreview(URL.createObjectURL(task.file));
    }
    setQueue((prev) => prev.filter((item) => item.id !== task.id));
    toast("Moved back to form", { icon: "✏️" });
  }, []);

  const clearCompleted = useCallback(() => {
    const completedCount = queue.filter((t) => t.status === "completed").length;
    if (completedCount === 0) return;

    if (window.confirm(`Clear ${completedCount} completed task(s)?`)) {
      setQueue((q) => q.filter((t) => t.status !== "completed"));
      toast.success(`Cleared ${completedCount} completed tasks`);
    }
  }, [queue]);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-10 text-slate-900">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <SectionHeader
            icon={LayoutGrid}
            title="INGREDIENT PIPELINE"
            size="xl"
            uppercase
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* JSON Import */}
          <Card padding="md" rounded="xl">
            <SectionHeader
              icon={FileJson}
              title="JSON Import"
              size="xs"
              uppercase
            />
            <textarea
              placeholder='{"name": "Tomato", "unit": "kg", "pricePerUnit": 60, "category": "vegetables", "isVeg": true}'
              className="w-full h-48 sm:h-64 lg:h-80 bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none border border-slate-200 mt-3 sm:mt-4"
              value={rawJson}
              onChange={handleJsonPaste}
            />
          </Card>

          {/* Entry Form */}
          <Card padding="md" rounded="xl" className="flex flex-col">
            <SectionHeader
              icon={Database}
              title="Entry Form"
              size="xs"
              uppercase
            />

            <div className="space-y-3 sm:space-y-4 flex-1 mt-3 sm:mt-4">
              <FormInput
                placeholder="Name (e.g., Tomato)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  required
                />
                <FormSelect
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  options={units}
                  capitalize
                />
              </div>

              <FormSelect
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={categories}
                capitalize
              />

              <MediaPicker
                imageFile={imageFile}
                imagePreview={imagePreview}
                onFileSelect={handleImageChange}
                onRemove={removeImage}
              />
            </div>

            <Button
              variant="dark"
              fullWidth
              onClick={addToQueue}
              disabled={
                queue.length >= MAX_QUEUE_SIZE || !imageFile || !formData.name
              }
              className="mt-4 sm:mt-6"
            >
              {queue.length >= MAX_QUEUE_SIZE ? "Queue Full" : "Add to Queue"}
            </Button>
          </Card>
        </div>

        {/* Queue Section */}
        <Card padding="none" rounded="2xl">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <SectionHeader
              title={`Processing Queue (${queue.length}/${MAX_QUEUE_SIZE})`}
              size="sm"
              uppercase
              action={
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={clearCompleted}
                  disabled={!queue.some((t) => t.status === "completed")}
                >
                  <span className="hidden sm:inline">CLEAR COMPLETED</span>
                  <span className="sm:hidden">CLEAR</span>
                </Button>
              }
            />
          </div>

          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {sortedQueue.length === 0 ? (
              <EmptyState
                icon={Database}
                title="Queue is empty"
                description="Add items to start processing"
              />
            ) : (
              sortedQueue.map((task) => {
                const statusVariants = {
                  error: "error",
                  processing: "processing",
                  completed: "success",
                  pending: "pending",
                };

                return (
                  <Card
                    key={task.id}
                    padding="md"
                    rounded="lg"
                    className={`${
                      task.status === "error"
                        ? "bg-rose-50 border-rose-200"
                        : task.status === "processing"
                          ? "bg-indigo-50 border-indigo-200"
                          : task.status === "completed"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                        <StatusIndicator
                          status={statusVariants[task.status]}
                          size="md"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-xs sm:text-sm truncate">
                            {task.payload.name}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            ₹{task.payload.pricePerUnit}/{task.payload.unit} •{" "}
                            {task.payload.category}
                          </p>

                          {task.status === "processing" &&
                            uploadProgress[task.id] !== undefined && (
                              <ProgressBar
                                progress={uploadProgress[task.id]}
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                              />
                            )}

                          <p
                            className={`text-[9px] sm:text-[10px] font-bold uppercase mt-1 ${
                              task.status === "error"
                                ? "text-rose-600"
                                : task.status === "processing"
                                  ? "text-indigo-600"
                                  : task.status === "completed"
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            }`}
                          >
                            {task.message}
                          </p>
                        </div>
                      </div>

                      {task.status === "error" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRetry(task)}
                          className="flex-shrink-0"
                        >
                          RETRY
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IngredientForm;
