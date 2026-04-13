import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Info, Percent, Tag, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useProduct } from "../context/ProductContext";
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
  INITIAL_FORM_STATE,
  PRODUCT_TYPES,
} from "../../../constants";
import { usePageMeta } from "../../../context/PageHeaderContext";
import KeywordManager from "../components/KeywordManager";
import ImageUploadSection from "../../../components/ImageUploadSection";
import QueueDisplay from "../../../components/QueueDisplay";
import PriceConfigForm from "../components/PriceConfigForm";
import toast from "react-hot-toast";

const NEW_PRICE_CONFIG = {
  label: "",
  qty: 1,
  unit: "kg",
  sellingPrice: "",
  mrp: "",
  stock: 0,
};

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  const { getProductById, updateProduct } = useProduct();
  const { queue, addToQueue, clearCompleted } = useProductQueue();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(isEditing ? null : INITIAL_FORM_STATE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  usePageMeta({ title: isEditing ? "Edit Product" : "Add Product" });

  // Load product for edit mode
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      try {
        const product = await getProductById(productId);
        setFormData(product);
        setImagePreview(product.images?.[0]);
      } catch {
        toast.error("Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, isEditing, getProductById, navigate]);

  // Revoke blob URL on cleanup
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#099E0E]" size={40} />
      </div>
    );
  }

  if (!formData) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPriceConfig = () => {
    handleFieldChange("priceConfigs", [
      ...formData.priceConfigs,
      { ...NEW_PRICE_CONFIG },
    ]);
  };

  const removePriceConfig = (index) => {
    if (formData.priceConfigs.length <= 1) return;
    handleFieldChange(
      "priceConfigs",
      formData.priceConfigs.filter((_, i) => i !== index),
    );
  };

  const updatePriceConfig = (index, field, value) => {
    const updated = [...formData.priceConfigs];
    updated[index] = { ...updated[index], [field]: value };
    handleFieldChange("priceConfigs", updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      setSaving(true);
      try {
        await updateProduct(productId, formData, imageFile);
        toast.success("Product updated");
        navigate("/products");
      } catch (err) {
        toast.error(err.message || "Update failed");
      } finally {
        setSaving(false);
      }
    } else {
      if (!imageFile) {
        return toast.error("Please upload an image");
      }
      addToQueue(formData, imageFile);
      setFormData(INITIAL_FORM_STATE);
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleRetry = useCallback((failedItem) => {
    setFormData(failedItem.data);
    if (failedItem.data.images?.[0]) setImagePreview(failedItem.data.images[0]);
    toast.success("Data restored to form.");
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      {isEditing ? (
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft size={18} /> Back
          </Button>
          <div className="text-right hidden sm:block">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Edit Product
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              ID: {productId}
            </p>
          </div>
        </div>
      ) : (
        <h1 className="hidden sm:block text-4xl font-black text-slate-900 mb-8">
          Create Product
        </h1>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Info */}
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
                label="Local Name"
                value={formData.localName || ""}
                onChange={(e) => handleFieldChange("localName", e.target.value)}
                placeholder="e.g. regional name"
              />
              <FormInput
                label="Brand"
                value={formData.brand || ""}
                onChange={(e) => handleFieldChange("brand", e.target.value)}
              />
              <FormSelect
                label="Product Type"
                options={PRODUCT_TYPES}
                value={formData.productType || "GROCERY"}
                onChange={(e) =>
                  handleFieldChange("productType", e.target.value)
                }
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Classification */}
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
                value={formData.subCategory || ""}
                onChange={(e) =>
                  handleFieldChange("subCategory", e.target.value)
                }
              />
              <div className="flex gap-8 bg-slate-50 p-4 rounded-xl md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available ?? true}
                    onChange={(e) =>
                      handleFieldChange("available", e.target.checked)
                    }
                  />{" "}
                  <span className="text-sm font-medium">Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic ?? false}
                    onChange={(e) =>
                      handleFieldChange("isOrganic", e.target.checked)
                    }
                  />{" "}
                  <span className="text-sm font-medium">Organic</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Price Configs */}
          <PriceConfigForm
            configs={formData.priceConfigs}
            onUpdate={updatePriceConfig}
            onAdd={addPriceConfig}
            onRemove={removePriceConfig}
            isEditing={isEditing}
          />
          {isEditing && (
            <p className="text-xs text-slate-400 italic px-2">
              Existing price configurations cannot be deleted to prevent order
              history errors.
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          <ImageUploadSection
            imagePreview={imagePreview}
            imageFile={imageFile}
            imageUrl={isEditing ? formData.images?.[0] || "" : ""}
            onImageChange={(file) => {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(isEditing ? formData.images?.[0] : null);
            }}
            onImageUrlChange={
              isEditing
                ? (val) => handleFieldChange("images", [val])
                : undefined
            }
          />

          <Card
            padding="lg"
            className="border-none shadow-sm ring-1 ring-slate-200"
          >
            <SectionHeader icon={Percent} title="Details & SEO" size="sm" />
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Tax Rate (%)"
                  type="number"
                  value={formData.taxRate ?? 0}
                  onChange={(e) => handleFieldChange("taxRate", e.target.value)}
                />
                <FormInput
                  label="Shelf Life (days)"
                  type="number"
                  value={formData.shelfLife || ""}
                  onChange={(e) =>
                    handleFieldChange("shelfLife", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Storage Instructions
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-16 text-sm"
                  value={formData.storageInstructions || ""}
                  onChange={(e) =>
                    handleFieldChange("storageInstructions", e.target.value)
                  }
                  placeholder="e.g. Store in a cool, dry place"
                />
              </div>
              <KeywordManager
                keywords={formData.keywords || []}
                onAdd={(w) =>
                  handleFieldChange("keywords", [
                    ...(formData.keywords || []),
                    w,
                  ])
                }
                onRemove={(idx) =>
                  handleFieldChange(
                    "keywords",
                    (formData.keywords || []).filter((_, i) => i !== idx),
                  )
                }
              />
            </div>
          </Card>

          <Button
            type="submit"
            variant="dark"
            fullWidth
            size="lg"
            disabled={saving}
          >
            {isEditing ? (
              <>
                <Save className="mr-2" size={20} />
                {saving ? "Updating..." : "Update Product"}
              </>
            ) : (
              "Push to Production"
            )}
          </Button>

          {!isEditing && (
            <QueueDisplay
              queue={queue}
              onClear={clearCompleted}
              onRetry={handleRetry}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
