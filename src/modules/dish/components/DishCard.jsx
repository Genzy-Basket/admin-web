// src/modules/dish/components/DishCard.jsx
import React, { memo } from "react";
import { Edit, Trash, Eye, Clock, Flame, Users, UtensilsCrossed } from "lucide-react";
import { Badge } from "../../../components/shared";
import { useDish } from "../context/DishContext";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../../components/shared/DeleteConfirmationModal";
import toast from "react-hot-toast";

const DishCard = memo(({ dish, onView }) => {
  const navigate = useNavigate();
  const { deleteDish } = useDish();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const confirmDelete = async () => {
    try {
      await deleteDish(dish._id);
      setShowDeleteModal(false);
      toast.success("Dish removed");
    } catch {
      toast.error("Could not delete dish");
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all group ${
          dish.available ? "border-slate-200" : "border-red-200 opacity-60"
        }`}
      >
        <div
          className="relative h-40 bg-slate-100 cursor-pointer"
          onClick={() => onView(dish)}
        >
          <img
            src={dish.dishImages?.[0]}
            alt={dish.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Badge variant={dish.isVeg ? "success" : "danger"}>
              {dish.isVeg ? "Veg" : "Non-Veg"}
            </Badge>
            {!dish.available && (
              <Badge variant="secondary">Unavailable</Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-slate-800 truncate mb-2">
            {dish.title}
          </h3>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {dish.prepTimeMinutes} min
            </span>
            {dish.calories && (
              <span className="flex items-center gap-1">
                <Flame size={12} /> {dish.calories} cal
              </span>
            )}
            {dish.servesCount > 1 && (
              <span className="flex items-center gap-1">
                <Users size={12} /> {dish.servesCount}
              </span>
            )}
            {dish.cuisine && (
              <span className="flex items-center gap-1">
                <UtensilsCrossed size={12} /> {dish.cuisine.replace(/-/g, " ")}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#078A0C] font-bold">
              {dish.ingredients?.length || 0} ingredients
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(dish)}
              className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex justify-center"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => navigate(`/dishes/edit/${dish._id}`)}
              className="flex-1 p-2 bg-emerald-50 hover:bg-emerald-100 text-[#099E0E] rounded-lg transition-colors flex justify-center"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={dish.title}
        itemImage={dish.dishImages?.[0]}
      />
    </>
  );
});

export default DishCard;
