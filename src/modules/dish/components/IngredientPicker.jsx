// src/modules/dish/components/IngredientPicker.jsx
import { useState, useMemo } from "react";
import { Search, X, Check, Plus, Trash2 } from "lucide-react";
import { Modal } from "../../../components/shared";
import { PRODUCT_UNITS, INGREDIENT_STATUSES } from "../../../constants";

const IngredientPicker = ({
  isOpen,
  onClose,
  products,
  existingIds,
  onAdd,
}) => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [staged, setStaged] = useState([]); // ingredients queued to add

  const stagedIds = useMemo(
    () => new Set(staged.map((s) => s.ingredientId)),
    [staged],
  );

  const allExistingIds = useMemo(
    () => new Set([...existingIds, ...stagedIds]),
    [existingIds, stagedIds],
  );

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
    if (allExistingIds.has(product._id)) return;
    setSelectedProduct(product);
    setSelectedConfig(product.priceConfigs?.[0] || null);
  };

  const handleStage = () => {
    if (!selectedProduct || allExistingIds.has(selectedProduct._id)) return;
    setStaged((prev) => [
      ...prev,
      {
        ingredientId: selectedProduct._id,
        _product: selectedProduct,
        quantity: selectedConfig?.qty || 1,
        unit: selectedConfig?.unit || "g",
        status: "essential",
      },
    ]);
    setSelectedProduct(null);
    setSelectedConfig(null);
  };

  const removeStaged = (id) => {
    setStaged((prev) => prev.filter((s) => s.ingredientId !== id));
  };

  const handleDone = () => {
    if (staged.length > 0) {
      onAdd(staged);
    }
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const reset = () => {
    setSelectedProduct(null);
    setSelectedConfig(null);
    setSearch("");
    setStaged([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add Ingredients"
      size="3xl"
    >
      <div className="flex flex-col sm:flex-row gap-4 h-[70vh] sm:h-[65vh]">
        {/* Left — product list */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative mb-3">
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

          <div className="flex-1 overflow-y-auto space-y-1 p-0.5">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-12">
                No products found
              </p>
            ) : (
              filtered.map((p) => {
                const alreadyAdded = existingIds.has(p._id);
                const isStaged = stagedIds.has(p._id);
                const isSelected = selectedProduct?._id === p._id;
                const disabled = alreadyAdded || isStaged;
                return (
                  <button
                    key={p._id}
                    onClick={() => handleSelect(p)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      disabled
                        ? "bg-emerald-50/60 opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "bg-[#099E0E]/10 ring-2 ring-[#099E0E]"
                          : "hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/40?text=?";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-700 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.category}
                        {p.priceConfigs?.length > 0 && (
                          <span className="ml-1.5 text-slate-300">
                            — {p.priceConfigs.length} variant
                            {p.priceConfigs.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    {(alreadyAdded || isStaged) && (
                      <Check
                        size={16}
                        className="text-emerald-600 shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right — detail + staged list */}
        <div className="sm:w-72 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex flex-col">
          {selectedProduct ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedProduct.images?.[0]}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/56?text=?";
                  }}
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {selectedProduct.category}
                  </p>
                </div>
              </div>

              {/* Price configs */}
              {selectedProduct.priceConfigs?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Select Variant
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-0.5">
                    {selectedProduct.priceConfigs.map((config) => {
                      const isActive = selectedConfig?._id === config._id;
                      return (
                        <button
                          key={config._id}
                          type="button"
                          onClick={() => setSelectedConfig(config)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                            isActive
                              ? "bg-[#099E0E]/10 ring-1 ring-[#099E0E] text-[#099E0E]"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-bold truncate">
                              {config.label}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {config.qty} {config.unit}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="font-black">
                              ₹{config.sellingPrice}
                            </p>
                            {config.mrp > config.sellingPrice && (
                              <p className="text-[10px] text-slate-400 line-through">
                                ₹{config.mrp}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleStage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#099E0E] hover:bg-[#078A0C] text-white rounded-xl font-bold text-sm transition-colors mb-4"
              >
                <Plus size={16} /> Add to List
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Search size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">Select a product</p>
              </div>
            </div>
          )}

          {/* Staged ingredients */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {staged.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Selected ({staged.length})
                </p>
                <div className="space-y-1.5">
                  {staged.map((ing) => (
                    <div
                      key={ing.ingredientId}
                      className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg"
                    >
                      <img
                        src={ing._product?.images?.[0]}
                        alt={ing._product?.name}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/32?text=?";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-700 truncate">
                          {ing._product?.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ing.quantity} {ing.unit}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStaged(ing.ingredientId)}
                        className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Done button */}
          <div className="pt-3 mt-auto border-t border-slate-200">
            <button
              type="button"
              onClick={handleDone}
              disabled={staged.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                staged.length > 0
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {staged.length > 0
                ? `Done — Add ${staged.length} Ingredient${staged.length > 1 ? "s" : ""}`
                : "Select ingredients"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const IngredientRow = ({ ingredient, onUpdate, onRemove }) => {
  const product = ingredient._product || ingredient.ingredientId;
  const productName =
    typeof product === "object" ? product.name : "Unknown Product";
  const productImage =
    typeof product === "object" ? product.images?.[0] : null;

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
            onChange={(e) =>
              onUpdate("quantity", parseFloat(e.target.value) || 0)
            }
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
