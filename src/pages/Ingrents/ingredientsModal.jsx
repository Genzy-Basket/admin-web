import { useIngredients } from "../../context/IngredientsContext";
import { X, Plus, Check } from "lucide-react";

export const IngredientModal = ({ isOpen, onClose, onSelect, selectedIds }) => {
  const { ingredients, loading } = useIngredients();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">
            Select Ingredients
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-center py-10 font-medium">Loading pantry...</p>
          ) : (
            ingredients.map((ing) => {
              const isAdded = selectedIds.includes(ing._id);
              return (
                <div
                  key={ing._id}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ing.imageUrl}
                      className="w-10 h-10 rounded-lg object-cover"
                      alt=""
                    />
                    <span className="font-semibold text-slate-700">
                      {ing.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelect(ing)}
                    className={`p-2 rounded-lg transition-all ${
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

        <div className="p-4 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
