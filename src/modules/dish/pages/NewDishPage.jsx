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
  Video,
  Upload,
  X,
  Code,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
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
import { useNavigate } from "react-router-dom";

const NewDishPage = () => {
  const navigate = useNavigate();
  const { createDish, uploadStatus } = useDish();
  const { products, fetchProducts } = useProduct();
  const [formData, setFormData] = useState(INITIAL_DISH_FORM_STATE);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState(false);

  usePageMeta({ title: "Add Dish" });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonText);
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        videoUrl: data.videoUrl || prev.videoUrl,
        prepTimeMinutes: data.prepTimeMinutes ?? prev.prepTimeMinutes,
        calories: data.calories ?? prev.calories,
        servesCount: data.servesCount ?? prev.servesCount,
        isVeg: data.isVeg ?? prev.isVeg,
        available: data.available ?? prev.available,
        cuisine: data.cuisine || prev.cuisine,
        mealTypes: Array.isArray(data.mealTypes)
          ? data.mealTypes
          : prev.mealTypes,
        dietaryTags: Array.isArray(data.dietaryTags)
          ? data.dietaryTags
          : prev.dietaryTags,
        instructions:
          Array.isArray(data.instructions) && data.instructions.length
            ? data.instructions
            : prev.instructions,
        keywords: Array.isArray(data.keywords) ? data.keywords : prev.keywords,
        ingredients: Array.isArray(data.ingredients)
          ? data.ingredients.map((ing) => ({
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
              status: ing.status || "essential",
            }))
          : prev.ingredients,
        // Images from JSON are URLs
        dishImages: Array.isArray(data.dishImages)
          ? data.dishImages.map((url) => ({ url, file: null, isNew: false }))
          : prev.dishImages,
        instructionImages: Array.isArray(data.instructionImages)
          ? data.instructionImages.map((url) => ({
              url,
              file: null,
              isNew: false,
            }))
          : prev.instructionImages,
      }));
      toast.success("JSON imported successfully");
      setJsonOpen(false);
      setJsonText("");
    } catch {
      toast.error("Invalid JSON");
    }
  };

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

      await createDish(payload);
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

      {/* JSON Import */}
      <Card
        padding="none"
        className="border-none shadow-sm bg-white ring-1 ring-slate-200 mb-8"
      >
        <button
          type="button"
          onClick={() => setJsonOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Code size={16} /> Import from JSON
          </span>
          {jsonOpen ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>
        {jsonOpen && (
          <div className="px-5 pb-5 space-y-3">
            <div className="relative">
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
<span className="text-slate-500">{`# AI PROMPT (click copy → paste with recipe image)
#
# Read the handwritten/printed recipe from the image.
# Return ONLY valid JSON, no extra text.
#
# RULES:
# - prepTimeMinutes = total prep + cooking time combined
# - calories = estimated per serving
# - isVeg = true if no meat/fish/egg
# - instructions = detailed step-by-step array
# - keywords = SEO search terms for the dish
# - description = 1-2 line summary of the dish`}</span>
{`
`}<span className="text-amber-400">{`# VALID OPTIONS:`}</span>{`
`}<span className="text-emerald-400">{`# cuisine (pick one): ${CUISINES.join(", ")}`}</span>{`
`}<span className="text-sky-400">{`# mealTypes (pick 1+): ${MEAL_TYPES.join(", ")}`}</span>{`
`}<span className="text-purple-400">{`# dietaryTags (pick 0+): ${DIETARY_TAGS.join(", ")}`}</span>{`

`}<span className="text-slate-300">{`{
  "title": "Paneer Butter Masala",
  "description": "Rich and creamy North Indian curry",
  "prepTimeMinutes": 30,
  "calories": 450,
  "servesCount": 2,
  "isVeg": true,
  "available": true,
  "cuisine": "north-indian",
  "mealTypes": ["lunch", "dinner"],
  "dietaryTags": ["high-protein"],
  "instructions": [
    "Soak cashews in warm water for 15 min",
    "Blend into smooth paste",
    "Heat butter, add cumin and spices",
    "Add tomato puree, cook 5 min",
    "Add cashew paste, simmer",
    "Add paneer cubes, cook 3 min",
    "Garnish with cream and coriander"
  ],
  "keywords": ["paneer", "butter masala", "curry", "gravy"]
}`}</span>
              </pre>
              <button
                type="button"
                onClick={() => {
                  const text = `Read the handwritten/printed recipe from the attached image. Return ONLY a valid JSON object, no extra text or explanation.

RULES:
- prepTimeMinutes = total prep + cooking time combined in minutes
- calories = estimated calories per serving
- isVeg = true if no meat, fish, or egg
- instructions = detailed step-by-step cooking instructions as an array of strings
- keywords = relevant SEO search terms for the dish
- description = 1-2 line summary of the dish

VALID OPTIONS (use exact values):
- cuisine (pick one): ${CUISINES.join(", ")}
- mealTypes (pick 1 or more): ${MEAL_TYPES.join(", ")}
- dietaryTags (pick 0 or more): ${DIETARY_TAGS.join(", ")}

OUTPUT FORMAT:
{
  "title": "",
  "description": "",
  "prepTimeMinutes": 0,
  "calories": 0,
  "servesCount": 1,
  "isVeg": true,
  "available": true,
  "cuisine": "",
  "mealTypes": [],
  "dietaryTags": [],
  "instructions": [],
  "keywords": []
}`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                title="Copy AI prompt with sample JSON"
              >
                {copied ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs h-48 resize-y"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste your dish JSON here..."
            />
            <Button
              type="button"
              variant="dark"
              size="sm"
              onClick={handleJsonImport}
              disabled={!jsonText.trim()}
            >
              Apply JSON
            </Button>
          </div>
        )}
      </Card>

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
        onAdd={(items) => addIngredients(items)}
      />

      {uploadStatus && <UploadProgressOverlay uploadStatus={uploadStatus} />}
    </div>
  );
};

export default NewDishPage;
