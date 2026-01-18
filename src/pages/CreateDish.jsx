import { useState } from "react";

function CreateDishForm() {
  const [dish, setDish] = useState({
    title: "",
    imageUrl: "",
    prepTimeMinutes: "",
    isVeg: false,
    ingredients: [""],
    instructions: [""],
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDish((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...dish.ingredients];
    newIngredients[index] = value;
    setDish((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setDish((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index) => {
    if (dish.ingredients.length > 1) {
      setDish((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }));
    }
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

  const handleSubmit = () => {
    console.log("Dish Data:", dish);
    alert("Dish created! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Create New Dish
        </h1>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dish Title *
            </label>
            <input
              type="text"
              name="title"
              value={dish.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Spaghetti Carbonara"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={dish.imageUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/dish-image.jpg"
            />
          </div>

          {/* Prep Time and Veg Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prep Time (minutes) *
              </label>
              <input
                type="number"
                name="prepTimeMinutes"
                value={dish.prepTimeMinutes}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={dish.isVeg}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Vegetarian
                </span>
              </label>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ingredients *
            </label>
            <div className="space-y-2">
              {dish.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) =>
                      handleIngredientChange(index, e.target.value)
                    }
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={dish.ingredients.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="w-full px-4 py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                + Add Ingredient
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instructions *
            </label>
            <div className="space-y-2">
              {dish.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-12 flex items-center justify-center bg-orange-100 text-orange-700 font-bold rounded-lg">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) =>
                      handleInstructionChange(index, e.target.value)
                    }
                    required
                    rows="2"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={dish.instructions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="w-full px-4 py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                + Add Instruction
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
          >
            Create Dish
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateDishForm;
