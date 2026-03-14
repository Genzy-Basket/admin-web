import React from "react";
import { Plus, Trash2, Database, AlertCircle } from "lucide-react";
import {
  Card,
  Button,
  FormInput,
  FormSelect,
} from "../../../components/shared";

import { PRODUCT_UNITS } from "../../../constants";

const PriceConfigForm = ({
  configs = [],
  onUpdate,
  onAdd,
  onRemove,
  isEditing = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-[#099E0E]" />
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
            Pricing & Variants
          </h3>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAdd}
            className="text-[#099E0E] hover:bg-emerald-50 font-bold"
          >
            <Plus size={16} className="mr-1" /> Add Variant
          </Button>
        )}
      </div>

      {/* Config Rows */}
      <div className="space-y-3">
        {configs.map((config, index) => (
          <Card
            key={index}
            padding="lg"
            className="relative border-none shadow-sm bg-slate-50 ring-1 ring-slate-200 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="md:col-span-2 lg:col-span-2">
                  <FormInput
                    label="Display Label"
                    placeholder="e.g. Small Pack"
                    value={config.displayLabel}
                    onChange={(e) =>
                      onUpdate(index, "displayLabel", e.target.value)
                    }
                    vPadding="py-2.5"
                  />
                </div>

                {/* Quantity */}
                <FormInput
                  label="Quantity"
                  type="number"
                  placeholder="1"
                  value={config.quantity}
                  onChange={(e) => onUpdate(index, "quantity", e.target.value)}
                  vPadding="py-2.5"
                />

                {/* Unit */}
                <FormSelect
                  label="Unit"
                  options={PRODUCT_UNITS}
                  value={config.unit}
                  onChange={(e) => onUpdate(index, "unit", e.target.value)}
                  vPadding="py-2.5"
                />

                {/* Price */}
                <FormInput
                  label="Sale Price (₹)"
                  type="number"
                  placeholder="0.00"
                  value={config.price}
                  onChange={(e) => onUpdate(index, "price", e.target.value)}
                  vPadding="py-2.5"
                />

                {/* MRP */}
                <FormInput
                  label="MRP (₹)"
                  type="number"
                  placeholder="0.00"
                  value={config.mrp}
                  onChange={(e) => onUpdate(index, "mrp", e.target.value)}
                  vPadding="py-2.5"
                />

                {/* Stock */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormInput
                      label="Stock Qty"
                      type="number"
                      placeholder="0"
                      value={config.stock}
                      onChange={(e) => onUpdate(index, "stock", e.target.value)}
                      vPadding="py-2.5"
                    />
                  </div>

                  {!isEditing && configs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="mb-1 p-2.5 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
                      title="Remove variant"
                      aria-label="Remove price config"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profit Margin Indicator */}
            {config.price &&
              config.mrp &&
              Number(config.mrp) > Number(config.price) && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                  {Math.round(
                    ((Number(config.mrp) - Number(config.price)) /
                      Number(config.mrp)) *
                      100,
                  )}
                  % OFF
                </div>
              )}
          </Card>
        ))}
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
          <AlertCircle size={16} />
          <p className="text-xs font-medium">
            Variants cannot be deleted in Edit Mode.
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceConfigForm;
