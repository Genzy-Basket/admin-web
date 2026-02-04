import { useIngredients } from "../../context/IngredientsContext";
import { X, Plus, Check } from "lucide-react";

export const IngredientModal = ({ isOpen, onClose, onSelect, selectedIds }) => {
  const { ingredients, loading } = useIngredients();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-base sm:text-lg text-slate-800">
            Select Ingredients
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-3 sm:p-4 space-y-2">
          {loading ? (
            <p className="text-center py-10 font-medium text-sm sm:text-base">
              Loading pantry...
            </p>
          ) : ingredients.length === 0 ? (
            <p className="text-center py-10 text-slate-500 text-sm">
              No ingredients available
            </p>
          ) : (
            ingredients.map((ing) => {
              const isAdded = selectedIds.includes(ing._id);
              return (
                <div
                  key={ing._id}
                  className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg sm:rounded-xl hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <img
                      src={ing.imageUrl}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0"
                      alt={ing.name}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-700 text-sm sm:text-base block truncate">
                        {ing.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ₹{ing.pricePerUnit}/{ing.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelect(ing)}
                    className={`p-2 rounded-lg transition-all shrink-0 ${
                      isAdded
                        ? "bg-green-500 text-white"
                        : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    }`}
                  >
                    {isAdded ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 sm:p-4 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 bg-slate-800 text-white font-bold rounded-lg sm:rounded-xl text-sm sm:text-base hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
