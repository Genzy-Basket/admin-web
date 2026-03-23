// src/modules/dish/components/IngredientPicker.jsx
import { useState, useMemo } from "react";
import { Search, X, Check, Package } from "lucide-react";
import { Modal, FormSelect } from "../../../components/shared";
import { PRODUCT_UNITS, INGREDIENT_STATUSES } from "../../../constants";

const IngredientPicker = ({
  isOpen,
  onClose,
  products,
  existingIds,
  onAdd,
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleSelect = (product) => {
    if (existingIds.has(product._id)) return;
    onAdd({
      ingredientId: product._id,
      _product: product,
      quantity: 1,
      unit: "g",
      status: "essential",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Ingredient" size="lg">
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">
            No products found
          </p>
        ) : (
          filtered.map((p) => {
            const added = existingIds.has(p._id);
            return (
              <button
                key={p._id}
                onClick={() => handleSelect(p)}
                disabled={added}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  added
                    ? "bg-emerald-50 opacity-60 cursor-not-allowed"
                    : "hover:bg-slate-50"
                }`}
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40?text=?";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-700 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400">{p.category}</p>
                </div>
                {added && <Check size={16} className="text-emerald-600" />}
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
};

const IngredientRow = ({ ingredient, onUpdate, onRemove }) => {
  const product = ingredient._product || ingredient.ingredientId;
  const productName =
    typeof product === "object" ? product.name : "Unknown Product";
  const productImage =
    typeof product === "object" ? product.imageUrl : null;

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <img
        src={productImage}
        alt={productName}
        className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/40?text=?";
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm text-slate-700 truncate">
            {productName}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={ingredient.quantity}
            onChange={(e) => onUpdate("quantity", parseFloat(e.target.value) || 0)}
            placeholder="Qty"
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none"
          />
          <select
            value={ingredient.unit}
            onChange={(e) => onUpdate("unit", e.target.value)}
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none bg-white"
          >
            {PRODUCT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select
            value={ingredient.status}
            onChange={(e) => onUpdate("status", e.target.value)}
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none bg-white capitalize"
          >
            {INGREDIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export { IngredientPicker, IngredientRow };
