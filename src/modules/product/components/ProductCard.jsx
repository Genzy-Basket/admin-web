// src/modules/product/components/ProductCard.jsx
import React, { memo } from "react";
import { Edit, Trash, Eye, IndianRupee } from "lucide-react";
import { Badge } from "../../../components/shared";
import { useProduct } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../../components/shared/DeleteConfirmationModal";
import toast from "react-hot-toast";

const ProductCard = memo(({ product, onView }) => {
  const navigate = useNavigate();
  const { deleteProduct } = useProduct();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const confirmDelete = async () => {
    try {
      await deleteProduct(product._id);
      setShowDeleteModal(false);
      toast.success("Product removed");
    } catch (err) {
      toast.error("Could not delete product");
    }
  };

  const mainConfig = product.priceConfigs?.[0];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
        <div
          className="relative h-40 bg-slate-100 cursor-pointer"
          onClick={() => onView(product)}
        >
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={product.isVeg ? "success" : "danger"}>
              {product.isVeg ? "Veg" : "Non-Veg"}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-slate-800 truncate mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mb-2">{product.category}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-[#078A0C] font-bold">
              <IndianRupee size={14} />
              <span>{mainConfig?.price || 0}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {mainConfig?.displayLabel}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(product)}
              className="flex-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex justify-center"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => navigate(`/products/edit/${product._id}`)}
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
        itemName={product.name}
        itemImage={product.images?.[0]}
      />
    </>
  );
});

export default ProductCard;
