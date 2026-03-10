import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Info,
  Tag,
  Database,
  Percent,
  Loader2,
} from "lucide-react";
import { useProduct } from "../context/ProductContext";
import {
  Card,
  SectionHeader,
  Button,
  FormInput,
  FormTextarea,
  FormSelect,
} from "../../../components/shared";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "../../../constants";
import { usePageMeta } from "../../../context/PageHeaderContext";
import KeywordManager from "../components/KeywordManager";
import PriceConfigForm from "../components/PriceConfigForm";
import ImageUploadSection from "../../../components/ImageUploadSection";
import toast from "react-hot-toast";

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProduct();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("produce");
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // No refresh button on the Edit Product page
  usePageMeta({ title: "Edit Product" });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProductById(productId);
        setFormData(product);
        setImagePreview(product.imageUrl);
        setActiveTab(product.isFMCG ? "fmcg" : "produce");
      } catch (err) {
        toast.error("Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, getProductById, navigate]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(productId, formData, imageFile);
      toast.success("Product updated successfully");
      navigate("/products");
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#099E0E]" size={40} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={18} /> Back
        </Button>
        <div className="text-right hidden sm:block">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Edit Product
          </h1>
          <p className="text-slate-500 text-sm font-medium">ID: {productId}</p>
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-7 space-y-6">
          <Card
            padding="lg"
            className="border-none shadow-sm ring-1 ring-slate-200"
          >
            <SectionHeader icon={Info} title="Core Details" size="sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <FormInput
                label={activeTab === "produce" ? "Common Name" : "Product Name"}
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                required
              />
              {activeTab === "fmcg" && (
                <FormInput
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => handleFieldChange("brand", e.target.value)}
                  required
                />
              )}
              <div className="md:col-span-2">
                <FormTextarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <SectionHeader
              icon={Database}
              title="Pricing & Inventory"
              size="sm"
            />
            <PriceConfigForm
              configs={formData.priceConfigs}
              onUpdate={(idx, field, val) => {
                const updated = [...formData.priceConfigs];
                updated[idx][field] = val;
                handleFieldChange("priceConfigs", updated);
              }}
              onAdd={() => {
                const newConfig = {
                  displayLabel: "",
                  quantity: 1,
                  unit: "kg",
                  price: "",
                  mrp: "",
                  stock: 0,
                };
                handleFieldChange("priceConfigs", [
                  ...formData.priceConfigs,
                  newConfig,
                ]);
              }}
              isEditing={true}
            />
            <p className="text-xs text-slate-400 italic px-2">
              Note: Existing price configurations cannot be deleted to prevent
              order history errors.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ImageUploadSection
            imagePreview={imagePreview}
            imageFile={imageFile}
            imageUrl={formData.imageUrl}
            onImageChange={(file) => {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(formData.imageUrl);
            }}
            onImageUrlChange={(val) => handleFieldChange("imageUrl", val)}
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
                onAdd={(word) =>
                  handleFieldChange("keywords", [...formData.keywords, word])
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

          <Button
            type="submit"
            variant="dark"
            fullWidth
            size="lg"
            className="py-4 shadow-xl"
          >
            <Save className="mr-2" size={20} /> Update Product
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
