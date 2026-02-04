import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Hooks
import { useIngredients } from "../../context/IngredientsContext";
import { useIngredientOperations } from "../../hooks/useIngredientOperations";

// Components
import { PageContainer, Badge, Button, Card } from "../../components/shared";
import IngredientFormFields from "../../components/IngredientFormFields";
import PriceConfigForm from "../../components/PriceConfigForm";
import KeywordManager from "../../components/KeywordManager";
import ImageUploadSection from "../../components/ImageUploadSection";

const UpdateIngredientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ingredients, loading, refetch } = useIngredients();
  const { updateIngredient, isProcessing } = useIngredientOperations();

  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    category: "vegetables",
    isVeg: true,
    available: true,
    keywords: [],
    priceConfigs: [
      {
        unit: "piece",
        value: 1,
        price: 0,
        mrp: 0,
      },
    ],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load ingredient data
  useEffect(() => {
    const ingredient = ingredients.find((item) => item._id === id);
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        imageUrl: ingredient.imageUrl,
        category: ingredient.category,
        isVeg: ingredient.isVeg,
        available:
          ingredient.available !== undefined ? ingredient.available : true,
        keywords: ingredient.keywords || [],
        priceConfigs: ingredient.priceConfigs || [
          { unit: "piece", value: 1, price: 0, mrp: 0 },
        ],
      });
      setImagePreview(ingredient.imageUrl);
    }
  }, [id, ingredients]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  // Field change handler
  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Image handlers
  const handleImageChange = useCallback(
    (file) => {
      if (imageFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [imageFile, imagePreview],
  );

  const removeImage = useCallback(() => {
    if (imageFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    const ingredient = ingredients.find((item) => item._id === id);
    setImagePreview(ingredient?.imageUrl || null);
  }, [imageFile, imagePreview, ingredients, id]);

  // Price config management
  const addPriceConfig = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: [
        ...prev.priceConfigs,
        { unit: "piece", value: 1, price: 0, mrp: 0 },
      ],
    }));
  }, []);

  const removePriceConfig = useCallback(
    (index) => {
      if (formData.priceConfigs.length <= 1) {
        toast.error("At least one price configuration is required");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        priceConfigs: prev.priceConfigs.filter((_, i) => i !== index),
      }));
    },
    [formData.priceConfigs.length],
  );

  const updatePriceConfig = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      priceConfigs: prev.priceConfigs.map((config, i) =>
        i === index
          ? {
              ...config,
              [field]: field === "unit" ? value : parseFloat(value) || 0,
            }
          : config,
      ),
    }));
  }, []);

  // Keyword management
  const addKeyword = useCallback((keyword) => {
    setFormData((prev) => ({
      ...prev,
      keywords: [...(prev.keywords || []), keyword],
    }));
  }, []);

  const updateKeyword = useCallback((index, value) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k, i) => (i === index ? value : k)),
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
    async (e) => {
      e.preventDefault();

      try {
        // Clean up keywords
        const cleanKeywords = (formData.keywords || []).filter(
          (k) => k && k.trim() !== "",
        );

        const updatePayload = {
          ...formData,
          keywords: cleanKeywords,
        };

        await updateIngredient(id, updatePayload, imageFile);

        toast.success("Updated successfully!");

        // Refetch ingredients if available
        if (refetch) await refetch();

        navigate("/ingredients");
      } catch (err) {
        console.error("Update failed:", err);

        if (err.response?.status === 403) {
          toast.error("Admin access required to update ingredients");
        } else if (err.response?.status === 401) {
          toast.error("Please login as admin to continue");
        } else if (err.response?.status === 404) {
          toast.error("Ingredient not found");
        } else if (err.response?.status === 400) {
          toast.error(`Validation error: ${err.response.data.message}`);
        } else {
          toast.error(err.response?.data?.message || "Update failed");
        }
      }
    },
    [id, formData, imageFile, updateIngredient, navigate, refetch],
  );

  if (loading) {
    return (
      <div className="p-6 sm:p-10 text-center font-bold">
        Loading Ingredient...
      </div>
    );
  }

  return (
    <PageContainer maxWidth="4xl" gradient="slate">
      <Toaster position="top-right" />

      <div className=" sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/ingredients")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl flex-1 sm:text-3xl font-black text-slate-800">
            Update Ingredient
          </h1>
          <Badge variant="warning" size="lg">
            Editing
          </Badge>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card padding="md" rounded="xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <IngredientFormFields
                formData={formData}
                onChange={handleFieldChange}
              />
            </div>
          </Card>

          {/* Image Upload */}
          <ImageUploadSection
            imagePreview={imagePreview}
            imageFile={imageFile}
            imageUrl={formData.imageUrl}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            onImageUrlChange={(url) => handleFieldChange("imageUrl", url)}
          />

          {/* Price Configurations */}
          <Card padding="md" rounded="xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Price Configurations
              </h2>
              <Badge variant="info" size="sm">
                {formData.priceConfigs.length} Config(s)
              </Badge>
            </div>

            <PriceConfigForm
              configs={formData.priceConfigs}
              onUpdate={updatePriceConfig}
              onAdd={addPriceConfig}
              onRemove={removePriceConfig}
              isEditing
            />
          </Card>

          {/* Keywords */}
          <Card padding="md" rounded="xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Search Keywords
              </h2>
              <Badge variant="info" size="sm">
                {formData.keywords.length} Keyword(s)
              </Badge>
            </div>

            <KeywordManager
              keywords={formData.keywords}
              onAdd={addKeyword}
              onRemove={removeKeyword}
              onUpdate={updateKeyword}
              editable
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end  bottom-4">
            <Button
              type="button"
              onClick={() => navigate("/ingredients")}
              variant="ghost"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500"
              variant="success"
              disabled={isProcessing}
            >
              <Save size={18} className="mr-2" />
              {isProcessing ? "Saving..." : "Update Ingredient"}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default UpdateIngredientPage;
