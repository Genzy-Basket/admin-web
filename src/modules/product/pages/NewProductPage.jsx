import React, { useState, useCallback } from "react";
import { Info, Percent, Tag } from "lucide-react";
import { useProductQueue } from "../hooks/useProductQueue";
import {
  Card,
  SectionHeader,
  Button,
  FormInput,
  FormSelect,
} from "../../../components/shared";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  INITIAL_FORM_STATE,
} from "../../../config/constants";
import KeywordManager from "../components/KeywordManager";
import ImageUploadSection from "../../../components/ImageUploadSection";
import QueueDisplay from "../../../components/QueueDisplay";
import PriceConfigForm from "../components/PriceConfigForm"; // IMPORT THIS
import toast from "react-hot-toast";

const NewProductPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { queue, addToQueue, clearCompleted } = useProductQueue();

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPriceConfig = () => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: [
        ...prev.priceConfigs,
        {
          displayLabel: "",
          quantity: 1,
          unit: "kg",
          price: "",
          mrp: "",
          stock: 0,
        },
      ],
    }));
  };

  const removePriceConfig = (index) => {
    if (formData.priceConfigs.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      priceConfigs: prev.priceConfigs.filter((_, i) => i !== index),
    }));
  };

  const updatePriceConfig = (index, field, value) => {
    const updated = [...formData.priceConfigs];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, priceConfigs: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile && !formData.imageUrl) {
      return toast.error("Please provide an image file or URL");
    }
    // Debug check:
    console.log("Submitting MRP check:", formData.priceConfigs[0].mrp);

    addToQueue(formData, imageFile);
    setFormData(INITIAL_FORM_STATE);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRetry = useCallback((failedItem) => {
    setFormData(failedItem.data);
    if (failedItem.data.imageUrl) setImagePreview(failedItem.data.imageUrl);
    toast.success("Data restored to form.");
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <h1 className="text-4xl font-black text-slate-900 mb-8">
        Create Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-7 space-y-6">
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={Info} title="General Information" size="sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <FormInput
                label="Product Name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                required
              />
              <FormInput
                label="Brand"
                value={formData.brand}
                onChange={(e) => handleFieldChange("brand", e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>

          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={Tag} title="Classification" size="sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormSelect
                label="Category"
                options={PRODUCT_CATEGORIES}
                value={formData.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
              />
              <FormInput
                label="Sub-Category"
                value={formData.subCategory}
                onChange={(e) =>
                  handleFieldChange("subCategory", e.target.value)
                }
              />
              <div className="flex gap-8 bg-slate-50 p-4 rounded-xl md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) =>
                      handleFieldChange("isVeg", e.target.checked)
                    }
                  />{" "}
                  Veg
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFMCG}
                    onChange={(e) =>
                      handleFieldChange("isFMCG", e.target.checked)
                    }
                  />{" "}
                  FMCG
                </label>
              </div>
            </div>
          </Card>

          {/* THE FIX: Use the Component! */}
          <PriceConfigForm
            configs={formData.priceConfigs}
            onUpdate={updatePriceConfig}
            onAdd={addPriceConfig}
            onRemove={removePriceConfig}
            isEditing={false}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ImageUploadSection
            imagePreview={imagePreview}
            imageFile={imageFile}
            onImageChange={(file) => {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
          />

          <Card
            padding="lg"
            className="border-none shadow-sm ring-1 ring-slate-200"
          >
            <SectionHeader icon={Percent} title="Tax & SEO" size="sm" />
            <div className="mt-6 space-y-6">
              <FormInput
                label="Tax Rate (%)"
                type="number"
                value={formData.taxRate}
                onChange={(e) => handleFieldChange("taxRate", e.target.value)}
              />
              <KeywordManager
                keywords={formData.keywords}
                onAdd={(w) =>
                  handleFieldChange("keywords", [...formData.keywords, w])
                }
                onRemove={(idx) =>
                  handleFieldChange(
                    "keywords",
                    formData.keywords.filter((_, i) => i !== idx),
                  )
                }
              />
            </div>
          </Card>

          <Button type="submit" variant="dark" fullWidth size="lg">
            Push to Production
          </Button>
          <QueueDisplay
            queue={queue}
            onClear={clearCompleted}
            onRetry={handleRetry}
          />
        </div>
      </form>
    </div>
  );
};

export default NewProductPage;
