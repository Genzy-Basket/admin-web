import { useCallback, useEffect, useState } from "react";
import { IngredientModal } from "./Ingrents/ingredientsModal";
import {
  Plus,
  GripVertical,
  Trash2,
  Flame,
  UtensilsCrossed,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  MediaPicker,
  DietaryTagsSelector,
  PageContainer,
  Card,
  FormInput,
  FormCheckbox,
  Button,
  SectionHeader,
  ListItem,
} from "./components/shared";
import { dishApi } from "../api/dishApi";
import { uploadToCloudinary } from "../api/axiosClient";

function CreateDishForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dish, setDish] = useState({
    title: "",
    imageUrl: "",
    prepTimeMinutes: "",
    calories: "",
    isVeg: false,
    dietaryTags: [],
    ingredients: [],
    instructions: [""],
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
    setDish((prev) => ({ ...prev, imageUrl: "" }));
  }, [imagePreview]);

  const toggleIngredientSelection = (ingredient) => {
    setDish((prev) => {
      const isAlreadyAdded = prev.ingredients.find(
        (i) => i._id === ingredient._id,
      );
      if (isAlreadyAdded) {
        return {
          ...prev,
          ingredients: prev.ingredients.filter((i) => i._id !== ingredient._id),
        };
      } else {
        return {
          ...prev,
          ingredients: [
            ...prev.ingredients,
            { ...ingredient, qty: 1, requirement: "essential" },
          ],
        };
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDish((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateIngredientDetail = (id, field, value) => {
    setDish((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing._id === id ? { ...ing, [field]: value } : ing,
      ),
    }));
  };

  const removeIngredient = (id) => {
    setDish((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i._id !== id),
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...dish.instructions];
    newInstructions[index] = value;
    setDish((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setDish((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    if (dish.instructions.length > 1) {
      setDish((prev) => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index),
      }));
    }
  };

  const onDragEndInstructions = (result) => {
    if (!result.destination) return;
    const items = Array.from(dish.instructions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDish((prev) => ({ ...prev, instructions: items }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validation
      if (!dish.title.trim()) {
        alert("Please enter a dish title");
        return;
      }
      if (!dish.prepTimeMinutes || dish.prepTimeMinutes <= 0) {
        alert("Please enter a valid prep time");
        return;
      }
      if (dish.ingredients.length === 0) {
        alert("Please add at least one ingredient");
        return;
      }
      const hasValidInstructions = dish.instructions.some(
        (inst) => inst.trim() !== "",
      );
      if (!hasValidInstructions) {
        alert("Please add at least one instruction");
        return;
      }

      // Upload image to Cloudinary if present
      let imageUrl = dish.imageUrl;
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      // Prepare dish data
      const dishData = {
        title: dish.title.trim(),
        imageUrl: imageUrl,
        prepTimeMinutes: Number(dish.prepTimeMinutes),
        calories: dish.calories ? Number(dish.calories) : undefined,
        isVeg: dish.isVeg,
        dietaryTags: dish.dietaryTags,
        ingredients: dish.ingredients.map((ing) => ({
          ingredientId: ing._id,
          quantity: Number(ing.qty),
          status: ing.requirement,
        })),
        instructions: dish.instructions.filter((inst) => inst.trim() !== ""),
      };

      // Submit to API
      const response = await dishApi.create(dishData);

      console.log("Dish created successfully:", response);
      alert("Dish created successfully!");

      // Reset form
      setDish({
        title: "",
        imageUrl: "",
        prepTimeMinutes: "",
        calories: "",
        isVeg: false,
        dietaryTags: [],
        ingredients: [],
        instructions: [""],
      });
      removeImage();
    } catch (error) {
      console.error("Error creating dish:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create dish. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Create New Dish"
      icon={UtensilsCrossed}
      gradient="orange"
    >
      <Card padding="lg">
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <SectionHeader title="Dish Cover Image" size="sm" uppercase />
            <div className="mt-2">
              <MediaPicker
                imageFile={imageFile}
                imagePreview={imagePreview}
                onFileSelect={handleImageChange}
                onRemove={removeImage}
              />
            </div>
          </div>

          {/* Title */}
          <FormInput
            label="Dish Title"
            name="title"
            value={dish.title}
            onChange={handleInputChange}
            placeholder="e.g., Spaghetti Carbonara"
            required
          />

          {/* Prep Time, Calories, and Veg Toggle */}
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Prep Time (min)"
              name="prepTimeMinutes"
              type="number"
              value={dish.prepTimeMinutes}
              onChange={handleInputChange}
              placeholder="30"
              min="1"
              required
            />

            <FormInput
              label="Calories"
              name="calories"
              type="number"
              value={dish.calories}
              onChange={handleInputChange}
              placeholder="250"
              min="0"
              icon={Flame}
            />

            <FormCheckbox
              label="Vegetarian"
              name="isVeg"
              checked={dish.isVeg}
              onChange={handleInputChange}
              className="flex items-end"
            />
          </div>

          {/* Dietary Tags */}
          <DietaryTagsSelector
            selectedTags={dish.dietaryTags}
            onChange={(tags) =>
              setDish((prev) => ({ ...prev, dietaryTags: tags }))
            }
          />

          {/* Ingredients */}
          <div>
            <SectionHeader
              title="Selected Ingredients"
              count={dish.ingredients.length}
              size="sm"
            />

            <div className="space-y-3 mt-4 mb-4">
              {dish.ingredients.map((ing) => (
                <ListItem
                  key={ing._id}
                  image={ing.imageUrl}
                  title={ing.name}
                  subtitle={`₹${ing.pricePerUnit}/${ing.unit}`}
                  rightSlot={
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Qty
                        </label>
                        <input
                          type="number"
                          value={ing.qty}
                          onChange={(e) =>
                            updateIngredientDetail(
                              ing._id,
                              "qty",
                              e.target.value,
                            )
                          }
                          className="w-16 px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                          min="1"
                        />
                        <span className="text-sm text-gray-600">
                          {ing.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          Status
                        </label>
                        <select
                          value={ing.requirement}
                          onChange={(e) =>
                            updateIngredientDetail(
                              ing._id,
                              "requirement",
                              e.target.value,
                            )
                          }
                          className="px-2 py-1 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="essential">Essential</option>
                          <option value="optional">Optional</option>
                          <option value="seasonal">Seasonal</option>
                        </select>
                      </div>
                    </div>
                  }
                  onRemove={() => removeIngredient(ing._id)}
                />
              ))}
            </div>

            <Button
              variant="dashed"
              fullWidth
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Select Ingredients from Pantry
            </Button>
          </div>

          {/* Instructions */}
          <div>
            <SectionHeader title="Instructions" size="sm" />

            <DragDropContext onDragEnd={onDragEndInstructions}>
              <Droppable droppableId="instructions-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 mt-4"
                  >
                    {dish.instructions.map((instruction, index) => (
                      <Draggable
                        key={`step-${index}`}
                        draggableId={`step-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex gap-3 p-2 rounded-xl border transition-all ${
                              snapshot.isDragging
                                ? "bg-orange-50 border-orange-300 shadow-lg"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center text-gray-400 hover:text-orange-500 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-orange-100 text-orange-700 font-bold rounded-lg shadow-sm">
                              {index + 1}
                            </div>

                            <textarea
                              value={instruction}
                              onChange={(e) =>
                                handleInstructionChange(index, e.target.value)
                              }
                              required
                              rows="2"
                              className="flex-1 px-4 py-2 border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-400"
                              placeholder={`Step ${index + 1}`}
                            />

                            <button
                              type="button"
                              onClick={() => removeInstruction(index)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start disabled:opacity-30"
                              disabled={dish.instructions.length === 1}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              variant="dashed"
              fullWidth
              icon={Plus}
              onClick={addInstruction}
              className="mt-4"
            >
              Add Instruction Step
            </Button>
          </div>

          {/* Submit */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Dish..." : "Create Dish"}
          </Button>
        </div>
      </Card>

      <IngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={toggleIngredientSelection}
        selectedIds={dish.ingredients.map((i) => i._id)}
      />
    </PageContainer>
  );
}

export default CreateDishForm;
