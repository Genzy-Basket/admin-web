import { useState, useCallback, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { LayoutGrid, FileJson, Database } from "lucide-react";
import { categories, units } from "../../config/constants";

// Hooks
import { useIngredientQueue } from "../../hooks/useIngredientQueue";

// Components
import {
  Card,
  Button,
  SectionHeader,
  MediaPicker,
} from "../../components/shared";
import IngredientFormFields from "../../components/IngredientFormFields";
import PriceConfigForm from "../../components/PriceConfigForm";
import KeywordManager from "../../components/KeywordManager";
import QueueDisplay from "../../components/QueueDisplay";

const DEFAULT_PRICE_CONFIG = {
  unit: "gram",
  value: "",
  price: "",
  mrp: "",
};

const INITIAL_FORM_STATE = {
  name: "",
  category: "vegetables",
  isVeg: true,
  available: true,
  keywords: [],
  priceConfigs: [{ ...DEFAULT_PRICE_CONFIG }],
};

const IngredientForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rawJson, setRawJson] = useState("");

  const {
    queue,
    queueStats,
    uploadProgress,
    addToQueue,
    retryTask,
    removeTask,
    clearCompleted,
    maxQueueSize,
  } = useIngredientQueue();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // JSON parsing logic
  const handleJsonPaste = useCallback((e) => {
    const value = e.target.value;
    setRawJson(value);

    if (!value.trim() || !value.includes("{")) return;

    try {
      let cleaned = value.trim();
      if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);

      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === "object") {
        let priceConfigs = [];

        if (parsed.priceConfigs && Array.isArray(parsed.priceConfigs)) {
          priceConfigs = parsed.priceConfigs;
        } else if (parsed.pricePerUnit || parsed.unit) {
          priceConfigs = [
            {
              unit: units.includes(parsed.unit?.toLowerCase())
                ? parsed.unit.toLowerCase()
                : "gram",
              value: parsed.value || 100,
              price: parsed.pricePerUnit || parsed.price || "",
              mrp: parsed.mrp || parsed.pricePerUnit || parsed.price || "",
            },
          ];
        } else {
          priceConfigs = [{ ...DEFAULT_PRICE_CONFIG }];
        }

        setFormData({
          name: parsed.name || "",
          category: categories.includes(parsed.category?.toLowerCase())
            ? parsed.category.toLowerCase()
            : "vegetables",
          isVeg: parsed.isVeg !== undefined ? parsed.isVeg : true,
          available: parsed.available !== undefined ? parsed.available : true,
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          priceConfigs,
        });
      }
    } catch (err) {
      console.debug("JSON parse error:", err.message);
    }
  }, []);

  // Image handling
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

  // Form data handlers
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Price config management
  const addPriceConfig = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: [...prev.priceConfigs, { ...DEFAULT_PRICE_CONFIG }],
    }));
  }, []);

  const removePriceConfig = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: prev.priceConfigs.filter((_, i) => i !== index),
    }));
  }, []);

  const updatePriceConfig = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: prev.priceConfigs.map((config, i) =>
        i === index ? { ...config, [field]: value } : config,
      ),
    }));
  }, []);

  // Keyword management
  const addKeyword = useCallback((keyword) => {
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, keyword],
    }));
  }, []);

  const removeKeyword = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  }, []);

  // Form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const success = addToQueue(formData, imageFile);

      if (success) {
        setFormData(INITIAL_FORM_STATE);
        removeImage();
        setRawJson("");
      }
    },
    [formData, imageFile, addToQueue, removeImage],
  );

  // Queue retry handler
  const handleRetry = useCallback(
    (task) => {
      const { formData: retryFormData, imageFile: retryImageFile } =
        retryTask(task);

      setFormData(retryFormData);
      if (retryImageFile) {
        setImageFile(retryImageFile);
        setImagePreview(URL.createObjectURL(retryImageFile));
      }

      removeTask(task.id);
      toast("Moved back to form", { icon: "✏️" });
    },
    [retryTask, removeTask],
  );

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
          <p className="text-sm text-slate-500 mt-2">
            Add ingredients using JSON import or manual entry
          </p>
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
              placeholder={`{
  "name": "Tomato",
  "category": "vegetables",
  "isVeg": true,
  "available": true,
  "keywords": ["fresh", "organic"],
  "priceConfigs": [
    { "unit": "kg", "value": 1, "price": 60, "mrp": 80 },
    { "unit": "gram", "value": 500, "price": 35, "mrp": 45 }
  ]
}`}
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

            <form
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-4 flex-1 mt-3 sm:mt-4"
            >
              <IngredientFormFields
                formData={formData}
                onChange={handleFieldChange}
              />
              <KeywordManager
                keywords={formData.keywords}
                onAdd={addKeyword}
                onRemove={removeKeyword}
              />
              <PriceConfigForm
                configs={formData.priceConfigs}
                onUpdate={updatePriceConfig}
                onAdd={addPriceConfig}
                onRemove={removePriceConfig}
              />
              <MediaPicker
                imageFile={imageFile}
                imagePreview={imagePreview}
                onFileSelect={handleImageChange}
                onRemove={removeImage}
              />
              <Button
                type="submit"
                variant="dark"
                fullWidth
                disabled={
                  queue.length >= maxQueueSize || !imageFile || !formData.name
                }
              >
                {queue.length >= maxQueueSize ? "Queue Full" : "Add to Queue"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Queue Section */}
        <QueueDisplay
          queue={queue}
          queueStats={queueStats}
          uploadProgress={uploadProgress}
          onRetry={handleRetry}
          onClearCompleted={clearCompleted}
          maxSize={maxQueueSize}
        />
      </div>
    </div>
  );
};

export default IngredientForm;
