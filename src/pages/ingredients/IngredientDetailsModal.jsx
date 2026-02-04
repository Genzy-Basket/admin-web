import { DollarSign, Package, Tag, X } from "lucide-react";
import { Badge } from "../../components/shared";

export function IngredientDetailsModal({
  selectedIngredient,
  setSelectedIngredient,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header with Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
          {selectedIngredient.imageUrl ? (
            <img
              src={selectedIngredient.imageUrl}
              alt={selectedIngredient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={60} className="text-white/50" />
            </div>
          )}
          <button
            onClick={() => setSelectedIngredient(null)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
          >
            <X size={20} className="text-gray-700" />
          </button>

          <div className="absolute bottom-3 left-3">
            <span
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow-lg ${
                selectedIngredient.isVeg
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {selectedIngredient.isVeg ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-16rem)]">
          {/* Title */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {selectedIngredient.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-mono break-all mb-3">
              ID: {selectedIngredient._id}
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" size="lg">
                {selectedIngredient.category}
              </Badge>
              <Badge
                variant={selectedIngredient.isVeg ? "success" : "danger"}
                size="lg"
              >
                {selectedIngredient.isVeg
                  ? "🌱 Vegetarian"
                  : "🍖 Non-Vegetarian"}
              </Badge>
            </div>
          </div>

          {/* Price Configurations */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase flex items-center gap-2">
              <DollarSign size={18} className="text-green-600" />
              Price Configurations (
              {selectedIngredient.priceConfigs?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedIngredient.priceConfigs &&
              selectedIngredient.priceConfigs.length > 0 ? (
                selectedIngredient.priceConfigs.map((config, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {/* Unit & Value */}
                      <div className="col-span-2 bg-white/70 rounded-lg p-3">
                        <p className="text-[10px] uppercase font-bold text-green-700 mb-1">
                          Package
                        </p>
                        <p className="text-lg font-black text-green-900">
                          {config.value} {config.unit}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-[10px] uppercase font-bold text-green-700 mb-1">
                          Price
                        </p>
                        <p className="text-base font-bold text-green-900">
                          ₹{config.price}
                        </p>
                      </div>

                      {/* MRP */}
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-[10px] uppercase font-bold text-green-700 mb-1">
                          MRP
                        </p>
                        <p className="text-base font-bold text-green-900">
                          ₹{config.mrp}
                        </p>
                      </div>

                      {/* Discount % */}
                      {config.mrp > config.price && (
                        <div className="col-span-2 bg-amber-50 rounded-lg p-2 border border-amber-200">
                          <p className="text-xs font-bold text-amber-800 text-center">
                            {(
                              ((config.mrp - config.price) / config.mrp) *
                              100
                            ).toFixed(1)}
                            % OFF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic col-span-2">
                  No price configurations available
                </p>
              )}
            </div>
          </div>

          {/* Keywords */}
          {selectedIngredient.keywords &&
            selectedIngredient.keywords.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <h3 className="text-xs sm:text-sm font-bold text-indigo-900 mb-3 uppercase flex items-center gap-2">
                  <Tag size={16} className="text-indigo-600" />
                  Keywords ({selectedIngredient.keywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredient.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-700 shadow-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Image URL */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">
              Image URL
            </p>
            <p className="text-xs text-gray-600 break-all font-mono">
              {selectedIngredient.imageUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
