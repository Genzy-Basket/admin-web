// src/modules/product/components/ProductModal.jsx
import React from "react";
import { X, CheckCircle, AlertCircle, Tag } from "lucide-react";
import { Modal, Badge } from "../../../components/shared";

const ProductModal = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image & Status */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant={product.available ? "success" : "danger"}>
              {product.available ? "In Stock" : "Out of Stock"}
            </Badge>
            {product.isFMCG && <Badge variant="warning">FMCG</Badge>}
            <Badge variant="secondary">Tax: {product.taxRate}%</Badge>
          </div>
        </div>

        {/* Right: Info & Pricing */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {product.name}
            </h2>
            <p className="text-slate-500">{product.brand || "Local Brand"}</p>
          </div>

          <p className="text-slate-600 text-sm">
            {product.description || "No description provided."}
          </p>

          <div className="border-t pt-4">
            <h4 className="font-bold text-sm text-slate-400 uppercase mb-3">
              Price Configurations
            </h4>
            <div className="space-y-2">
              {product.priceConfigs.map((config) => (
                <div
                  key={config._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">
                      {config.displayLabel}
                    </span>
                    <span className="text-xs text-slate-400">
                      {config.quantity} {config.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-indigo-600">
                      ₹{config.price}
                    </div>
                    {config.mrp > config.price && (
                      <div className="text-[10px] text-slate-400 line-through">
                        MRP: ₹{config.mrp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {product.keywords?.length > 0 && (
            <div className="pt-2">
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
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
