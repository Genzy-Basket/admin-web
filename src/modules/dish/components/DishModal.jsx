// src/modules/dish/components/DishModal.jsx
import { Modal, Badge } from "../../../components/shared";
import { Clock, Flame, Users, UtensilsCrossed, Tag } from "lucide-react";

const DishModal = ({ dish, isOpen, onClose }) => {
  if (!dish) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dish.title} size="2xl">
      <div className="flex flex-col gap-5">
        {/* Image */}
        <img
          src={dish.dishImages?.[0]}
          alt={dish.title}
          className="w-full h-48 sm:h-56 object-cover rounded-xl"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
          }}
        />

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={dish.isVeg ? "success" : "danger"}>
            {dish.isVeg ? "Veg" : "Non-Veg"}
          </Badge>
          <Badge variant={dish.available ? "success" : "secondary"}>
            {dish.available ? "Available" : "Unavailable"}
          </Badge>
          {dish.cuisine && (
            <Badge variant="warning">{dish.cuisine.replace(/-/g, " ")}</Badge>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            {dish.prepTimeMinutes} min
          </span>
          {dish.calories && (
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-slate-400" />
              {dish.calories} cal
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            Serves {dish.servesCount}
          </span>
        </div>

        {/* Description */}
        {dish.description && (
          <p className="text-sm text-slate-600 leading-relaxed italic">
            {dish.description}
          </p>
        )}

        {/* Meal Types */}
        {dish.mealTypes?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Meal Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {dish.mealTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Tags */}
        {dish.dietaryTags?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Dietary Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {dish.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {dish.ingredients?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Ingredients ({dish.ingredients.length})
            </h4>
            <div className="space-y-2">
              {dish.ingredients.map((ing, i) => {
                const product = ing.ingredientId;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <img
                      src={product?.images?.[0]}
                      alt={product?.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/40?text=?";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 text-sm truncate">
                        {product?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {ing.quantity} {ing.unit} per person
                      </p>
                    </div>
                    <Badge
                      variant={
                        ing.status === "essential"
                          ? "success"
                          : ing.status === "optional"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {ing.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        {dish.instructions?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Instructions
            </h4>
            <ol className="space-y-2">
              {dish.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[#099E0E] text-white text-xs font-bold rounded-full">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Keywords */}
        {dish.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dish.keywords.map((k, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-[#099E0E] text-[10px] font-bold rounded"
              >
                <Tag size={10} /> {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DishModal;
