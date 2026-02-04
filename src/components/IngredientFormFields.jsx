import React from "react";
import { FormInput, FormSelect } from "./shared";
import { categories } from "../config/constants";

/**
 * Reusable basic ingredient form fields
 * @param {Object} formData - Form data object
 * @param {Function} onChange - Callback for field changes (fieldName, value)
 */
const IngredientFormFields = ({ formData, onChange }) => {
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange(field, value);
  };

  return (
    <>
      <FormInput
        placeholder="Name (e.g., Tomato)"
        value={formData.name}
        onChange={handleChange("name")}
        required
        label="Ingredient Name"
      />

      <FormSelect
        value={formData.category}
        onChange={handleChange("category")}
        options={categories}
        capitalize
        label="Category"
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isVeg}
            onChange={handleChange("isVeg")}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Vegetarian
        </label>
        <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.available}
            onChange={handleChange("available")}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Available
        </label>
      </div>
    </>
  );
};

export default IngredientFormFields;
