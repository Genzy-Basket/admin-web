import { X, Tag } from "lucide-react";
import { Modal, Badge } from "../../../components/shared";

const ProductModal = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="2xl">
      <div className="flex flex-col gap-5">
        {/* Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-cover rounded-xl"
        />

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={product.isVeg ? "success" : "danger"}>
            {product.isVeg ? "Veg" : "Non-Veg"}
          </Badge>
          <Badge variant={product.available ? "success" : "danger"}>
            {product.available ? "In Stock" : "Out of Stock"}
          </Badge>
          {product.isFMCG && <Badge variant="warning">FMCG</Badge>}
          <Badge variant="secondary">Tax: {product.taxRate}%</Badge>
        </div>

        {/* Meta */}
        <div>
          <p className="text-sm text-slate-500">{product.brand || "Local Brand"}</p>
          <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
          {product.description && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price configs */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Price Configurations
          </h4>
          <div className="space-y-2">
            {product.priceConfigs.map((config) => (
              <div
                key={config._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-700 text-sm">
                    {config.displayLabel}
                  </p>
                  <p className="text-xs text-slate-400">
                    {config.quantity} {config.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600">₹{config.price}</p>
                  {config.mrp > config.price && (
                    <p className="text-[10px] text-slate-400 line-through">
                      MRP ₹{config.mrp}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        {product.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.keywords.map((k, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded"
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

export default ProductModal;
