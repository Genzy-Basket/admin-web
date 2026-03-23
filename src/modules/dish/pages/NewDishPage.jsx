// src/modules/dish/pages/NewDishPage.jsx
import { useState, useEffect } from "react";
import {
  Info,
  UtensilsCrossed,
  ListOrdered,
  Tag,
  Plus,
  Clock,
  Flame,
  Users,
} from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  FormInput,
  FormSelect,
} from "../../../components/shared";
import {
  MEAL_TYPES,
  DIETARY_TAGS,
  CUISINES,
  INITIAL_DISH_FORM_STATE,
} from "../../../constants";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { useDish } from "../context/DishContext";
import { useProduct } from "../../product/context/ProductContext";
import ImageUploadSection from "../../../components/ImageUploadSection";
import KeywordManager from "../../product/components/KeywordManager";
import { IngredientPicker, IngredientRow } from "../components/IngredientPicker";
import InstructionEditor from "../components/InstructionEditor";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const NewDishPage = () => {
  const navigate = useNavigate();
  const { createDish } = useDish();
  const { products, fetchProducts } = useProduct();
  const [formData, setFormData] = useState(INITIAL_DISH_FORM_STATE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  usePageMeta({ title: "Add Dish" });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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

  const addIngredient = (ingredient) => {
    handleFieldChange("ingredients", [...formData.ingredients, ingredient]);
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

    if (!imageFile && !formData.imageUrl) {
      return toast.error("Please provide an image");
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
      // Clean data for API
      const payload = {
        ...formData,
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        calories: formData.calories ? Number(formData.calories) : undefined,
        servesCount: Number(formData.servesCount) || 1,
        instructions: formData.instructions.filter((s) => s.trim()),
        ingredients: formData.ingredients.map(({ _product, ...rest }) => rest),
      };

      await createDish(imageFile, payload);
      toast.success("Dish created successfully");
      navigate("/dishes");
    } catch {
      // error handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <h1 className="hidden sm:block text-4xl font-black text-slate-900 mb-8">
        Create Dish
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Info */}
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
                  placeholder="e.g. Paneer Butter Masala"
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
                  placeholder="Brief description of the dish..."
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
                No ingredients added yet. Click "Add" to select from products.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.ingredients.map((ing, i) => (
                  <IngredientRow
                    key={ing.ingredientId}
                    ingredient={ing}
                    onUpdate={(field, value) => updateIngredient(i, field, value)}
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
            <SectionHeader
              icon={ListOrdered}
              title="Instructions"
              size="sm"
            />
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
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Dish"}
          </Button>
        </div>
      </form>

      <IngredientPicker
        isOpen={showIngredientPicker}
        onClose={() => setShowIngredientPicker(false)}
        products={products}
        existingIds={existingIngredientIds}
        onAdd={(ing) => {
          addIngredient(ing);
          setShowIngredientPicker(false);
        }}
      />
    </div>
  );
};

export default NewDishPage;
