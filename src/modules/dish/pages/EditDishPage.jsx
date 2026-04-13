// src/modules/dish/pages/EditDishPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Info,
  UtensilsCrossed,
  ListOrdered,
  Tag,
  Plus,
  Clock,
  Flame,
  Users,
  Loader2,
  Video,
  Upload,
  X,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  FormInput,
  FormSelect,
} from "../../../components/shared";
import { MEAL_TYPES, DIETARY_TAGS, CUISINES } from "../../../constants";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { useDish } from "../context/DishContext";
import UploadProgressOverlay from "../components/UploadProgressOverlay";
import { useProduct } from "../../product/context/ProductContext";
import MultiImageUpload from "../components/MultiImageUpload";
import KeywordManager from "../../product/components/KeywordManager";
import {
  IngredientPicker,
  IngredientRow,
} from "../components/IngredientPicker";
import InstructionEditor from "../components/InstructionEditor";
import toast from "react-hot-toast";

const EditDishPage = () => {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const { getDishById, updateDish, uploadStatus } = useDish();
  const { products, fetchProducts } = useProduct();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageMeta({ title: "Edit Dish" });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadDish = async () => {
      try {
        const dish = await getDishById(dishId);
        // Map populated ingredients to editable format
        const ingredients = (dish.ingredients || []).map((ing) => ({
          ingredientId:
            typeof ing.ingredientId === "object"
              ? ing.ingredientId._id
              : ing.ingredientId,
          _product:
            typeof ing.ingredientId === "object" ? ing.ingredientId : null,
          quantity: ing.quantity,
          unit: ing.unit,
          status: ing.status,
        }));

        // Convert existing images to the { url, file, isNew } format
        const existingDishImages = (dish.dishImages || []).map((url) => ({
          url,
          file: null,
          isNew: false,
        }));
        const existingInstrImages = (dish.instructionImages || []).map(
          (url) => ({
            url,
            file: null,
            isNew: false,
          }),
        );

        setFormData({
          ...dish,
          dishImages: existingDishImages,
          instructionImages: existingInstrImages,
          ingredients,
          instructions:
            dish.instructions?.length > 0 ? dish.instructions : [""],
          keywords: dish.keywords || [],
          mealTypes: dish.mealTypes || [],
          dietaryTags: dish.dietaryTags || [],
          cuisine: dish.cuisine || "",
          calories: dish.calories || "",
          prepTimeMinutes: dish.prepTimeMinutes || "",
          servesCount: dish.servesCount || 1,
          videoFile: null,
          videoUrl: dish.videoUrl || "",
        });
      } catch {
        toast.error("Failed to load dish");
        navigate("/dishes");
      } finally {
        setLoading(false);
      }
    };
    loadDish();
  }, [dishId, getDishById, navigate]);

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

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const addIngredients = (items) => {
    handleFieldChange("ingredients", [...formData.ingredients, ...items]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    handleFieldChange("ingredients", updated);
  };

  const removeIngredient = (index) => {
    handleFieldChange(
      "ingredients",
      formData.ingredients.filter((_, i) => i !== index),
    );
  };

  const existingIngredientIds = new Set(
    formData.ingredients.map((ing) => ing.ingredientId),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dishImages.length === 0) {
      return toast.error("Please add at least one image");
    }
    if (!formData.title.trim()) {
      return toast.error("Title is required");
    }
    if (!formData.prepTimeMinutes || formData.prepTimeMinutes <= 0) {
      return toast.error("Prep time must be greater than 0");
    }
    if (formData.ingredients.length === 0) {
      return toast.error("Add at least one ingredient");
    }
    for (const ing of formData.ingredients) {
      if (!ing.quantity || ing.quantity <= 0) {
        return toast.error("All ingredient quantities must be greater than 0");
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        dishImages: formData.dishImages,
        instructionImages: formData.instructionImages,
        videoFile: formData.videoFile || null,
        videoUrl: formData.videoUrl?.trim() || "",
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        calories: formData.calories ? Number(formData.calories) : undefined,
        servesCount: Number(formData.servesCount) || 1,
        isVeg: formData.isVeg,
        available: formData.available,
        cuisine: formData.cuisine || undefined,
        mealTypes: formData.mealTypes,
        dietaryTags: formData.dietaryTags,
        instructions: formData.instructions.filter((s) => s.trim()),
        keywords: formData.keywords,
        ingredients: formData.ingredients.map(({ _product, ...rest }) => rest),
      };

      await updateDish(dishId, payload);
      toast.success("Dish updated successfully");
      navigate("/dishes");
    } catch {
      // error handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={18} /> Back
        </Button>
        <div className="text-right hidden sm:block">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Edit Dish
          </h1>
          <p className="text-slate-500 text-sm font-medium">ID: {dishId}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={Info} title="Dish Information" size="sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="md:col-span-2">
                <FormInput
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-20"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </div>
              <FormInput
                label="Prep Time (min)"
                type="number"
                min="1"
                value={formData.prepTimeMinutes}
                onChange={(e) =>
                  handleFieldChange("prepTimeMinutes", e.target.value)
                }
                required
                icon={Clock}
              />
              <FormInput
                label="Calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => handleFieldChange("calories", e.target.value)}
                icon={Flame}
              />
              <FormInput
                label="Serves"
                type="number"
                min="1"
                value={formData.servesCount}
                onChange={(e) =>
                  handleFieldChange("servesCount", e.target.value)
                }
                icon={Users}
              />
              <FormSelect
                label="Cuisine"
                value={formData.cuisine}
                onChange={(e) => handleFieldChange("cuisine", e.target.value)}
                options={[
                  { value: "", label: "None" },
                  ...CUISINES.map((c) => ({
                    value: c,
                    label: c.replace(/-/g, " "),
                  })),
                ]}
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
                  <span className="text-sm font-medium">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      handleFieldChange("available", e.target.checked)
                    }
                  />{" "}
                  <span className="text-sm font-medium">
                    Available
                    <span className="text-xs text-slate-400 ml-1">
                      ({formData.available ? "visible" : "hidden"} to users)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* Meal Types */}
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader
              icon={UtensilsCrossed}
              title="Meal Types"
              size="sm"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem("mealTypes", type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors capitalize ${
                    formData.mealTypes.includes(type)
                      ? "bg-[#099E0E] border-[#099E0E] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Card>

          {/* Dietary Tags */}
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={Tag} title="Dietary Tags" size="sm" />
            <div className="flex flex-wrap gap-2 mt-4">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleArrayItem("dietaryTags", tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    formData.dietaryTags.includes(tag)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Card>

          {/* Ingredients */}
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                icon={UtensilsCrossed}
                title="Ingredients"
                count={formData.ingredients.length}
                size="sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowIngredientPicker(true)}
                className="text-[#099E0E]"
              >
                <Plus size={16} className="mr-1" /> Add
              </Button>
            </div>

            {formData.ingredients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                No ingredients added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.ingredients.map((ing, i) => (
                  <IngredientRow
                    key={ing.ingredientId}
                    ingredient={ing}
                    onUpdate={(field, value) =>
                      updateIngredient(i, field, value)
                    }
                    onRemove={() => removeIngredient(i)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Instructions */}
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={ListOrdered} title="Instructions" size="sm" />
            <div className="mt-4">
              <InstructionEditor
                instructions={formData.instructions}
                onChange={(val) => handleFieldChange("instructions", val)}
              />
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            padding="lg"
            className="border-none shadow-sm bg-white ring-1 ring-slate-200"
          >
            <SectionHeader icon={Upload} title="Media" size="sm" />
            <div className="mt-6 space-y-6">
              {/* Dish Images */}
              <div>
                <MultiImageUpload
                  images={formData.dishImages}
                  onImagesChange={(imgs) =>
                    handleFieldChange("dishImages", imgs)
                  }
                />
              </div>

              <hr className="border-slate-200" />

              {/* Video */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Video size={14} className="inline mr-1.5 -mt-0.5" />
                  Video
                </label>
                {formData.videoFile || formData.videoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <Video size={20} className="text-[#099E0E] shrink-0" />
                    <span className="text-sm text-slate-700 truncate flex-1">
                      {formData.videoFile?.name || formData.videoUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange("videoFile", null);
                        handleFieldChange("videoUrl", "");
                      }}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors text-sm">
                    <Upload size={16} />
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFieldChange("videoFile", file);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Instruction Images */}
              <div>
                <MultiImageUpload
                  title="Instruction Images"
                  maxImages={20}
                  images={formData.instructionImages}
                  onImagesChange={(imgs) =>
                    handleFieldChange("instructionImages", imgs)
                  }
                />
              </div>
            </div>
          </Card>

          <Card
            padding="lg"
            className="border-none shadow-sm ring-1 ring-slate-200"
          >
            <SectionHeader icon={Tag} title="Keywords (SEO)" size="sm" />
            <div className="mt-4">
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

          <Button
            type="submit"
            variant="dark"
            fullWidth
            size="lg"
            className="py-4 shadow-xl"
            disabled={saving}
          >
            <Save className="mr-2" size={20} />
            {saving ? "Updating..." : "Update Dish"}
          </Button>
        </div>
      </form>

      <IngredientPicker
        isOpen={showIngredientPicker}
        onClose={() => setShowIngredientPicker(false)}
        products={products}
        existingIds={existingIngredientIds}
        onAdd={(items) => addIngredients(items)}
      />

      {uploadStatus && <UploadProgressOverlay uploadStatus={uploadStatus} />}
    </div>
  );
};

export default EditDishPage;
