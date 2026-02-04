import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Button, FormInput, FormSelect } from "./shared";
import { units } from "../config/constants";

/**
 * Reusable component for managing price configurations
 * @param {Array} configs - Array of price configurations
 * @param {Function} onUpdate - Callback when a config is updated (index, field, value)
 * @param {Function} onAdd - Callback to add a new config
 * @param {Function} onRemove - Callback to remove a config (index)
 * @param {boolean} isEditing - Whether in edit mode (affects styling)
 */
const PriceConfigForm = ({
  configs = [],
  onUpdate,
  onAdd,
  onRemove,
  isEditing = false,
}) => {
  const containerClass = isEditing
    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    : "bg-slate-50";

  const labelClass = isEditing ? "text-green-700" : "text-slate-700";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase">
          Price Configurations
        </label>
        <Button type="button" variant="ghost" size="xs" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {configs.map((config, index) => (
        <Card key={index} padding="sm" rounded="lg" className={containerClass}>
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Value"
                  value={config.value}
                  onChange={(e) => onUpdate(index, "value", e.target.value)}
                  label="Quantity"
                  labelClassName={labelClass}
                  vPadding="py-2"
                />
                <FormSelect
                  value={config.unit}
                  onChange={(e) => onUpdate(index, "unit", e.target.value)}
                  options={units}
                  capitalize
                  label="Unit"
                  labelClassName={labelClass}
                  vPadding="py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price ₹"
                  value={config.price}
                  onChange={(e) => onUpdate(index, "price", e.target.value)}
                  label="Price"
                  labelClassName={labelClass}
                  vPadding="py-2"
                />
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="MRP ₹"
                  value={config.mrp}
                  onChange={(e) => onUpdate(index, "mrp", e.target.value)}
                  label="MRP"
                  labelClassName={labelClass}
                  vPadding="py-2"
                />
              </div>
            </div>
            {configs.length > 1 && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PriceConfigForm;
