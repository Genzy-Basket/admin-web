import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Search, X, Filter, Delete, Trash } from "lucide-react";
import { useIngredients } from "../../context/IngredientsContext";
import { PageContainer, Badge } from "../../components/shared";
import { IngredientDetailsModal } from "./IngredientDetailsModal";

const CATEGORIES = [
  "all",
  "vegetables",
  "meat",
  "fruits",
  "dairy",
  "coconut products",
  "egg",
  "snacks",
  "bakery",
  "oils",
  "pulses",
  "rice & grains",
  "flours",
];

const ViewIngredients = () => {
  const navigate = useNavigate();
  const {
    ingredients,
    loading,
    refreshIngredients,
    deleteIngredient,
    searchIngredients,
    filterIngredients,
  } = useIngredients();

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterVeg, setFilterVeg] = useState(null); // null = all, true = veg, false = non-veg
  const [displayedIngredients, setDisplayedIngredients] = useState([]);

  useEffect(() => {
    refreshIngredients();
  }, [refreshIngredients]);

  // Apply search and filters
  useEffect(() => {
    let result = ingredients;

    // Apply search
    if (searchTerm.trim()) {
      result = searchIngredients(searchTerm);
    }

    // Apply filters
    const filters = {};
    if (selectedCategory !== "all") {
      filters.category = selectedCategory;
    }
    if (filterVeg !== null) {
      filters.isVeg = filterVeg;
    }

    if (Object.keys(filters).length > 0) {
      result = filterIngredients(filters);
    }

    setDisplayedIngredients(result);
  }, [
    ingredients,
    searchTerm,
    selectedCategory,
    filterVeg,
    searchIngredients,
    filterIngredients,
  ]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?"))
      return;

    try {
      await deleteIngredient(id);
      alert("Ingredient deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);

      // Better error handling
      if (err.response?.status === 403) {
        alert("Admin access required to delete ingredients");
      } else if (err.response?.status === 401) {
        alert("Please login as admin to continue");
      } else if (err.response?.status === 404) {
        alert("Ingredient not found");
      } else {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/ingredients/update/${id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setFilterVeg(null);
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== "all" || filterVeg !== null;

  if (loading && ingredients.length === 0) {
    return (
      <div className="p-6 sm:p-10 text-center font-bold">
        Loading Inventory...
      </div>
    );
  }

  return (
    <PageContainer maxWidth="7xl" gradient="slate">
      <div className="p-0 sm:p-6 lg:p-8">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6">
          Inventory Management ({displayedIngredients.length})
        </h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name, category, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0 lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all"
                      ? "All Categories"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Veg/Non-Veg Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterVeg(null)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  filterVeg === null
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVeg(true)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  filterVeg === true
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🌱 Veg
              </button>
              <button
                onClick={() => setFilterVeg(false)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  filterVeg === false
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🍖 Non-Veg
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* No Results */}
        {displayedIngredients.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              No ingredients found
            </h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Cards Grid - Mobile & Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedIngredients.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div
                className="relative h-48 bg-linear-to-br from-slate-100 to-slate-200 cursor-pointer overflow-hidden"
                onClick={() => setSelectedIngredient(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={item.isVeg ? "success" : "danger"} size="sm">
                    {item.isVeg ? "🌱" : "🍖"}
                  </Badge>
                </div>
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Name and Category */}
                <div className="mb-3">
                  <h3
                    className="font-bold text-slate-800 text-lg mb-1 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1"
                    onClick={() => setSelectedIngredient(item)}
                  >
                    {item.name}
                  </h3>
                  <Badge variant="secondary" size="sm">
                    {item.category}
                  </Badge>
                </div>

                {/* Price Configurations */}
                <div className="mb-4">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-2">
                    Pricing ({item.priceConfigs?.length || 0})
                  </p>
                  <div className="space-y-1.5 flex-wrap">
                    {item.priceConfigs?.slice(0, 2).map((config, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between  text-xs bg-green-50 px-2 py-1.5 rounded border border-green-100"
                      >
                        <span className="font-semibold text-green-700">
                          {config.value} {config.unit}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-900">
                            ₹{config.price}
                          </span>
                          {config.mrp > config.price && (
                            <span className="text-[10px] text-slate-500 line-through">
                              ₹{config.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {item.priceConfigs?.length > 2 && (
                      <p className="text-xs text-slate-500 text-center">
                        +{item.priceConfigs.length - 2} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                {item.keywords?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[10px] font-medium text-indigo-700"
                        >
                          {keyword}
                        </span>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium text-slate-500">
                          +{item.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIngredient(item)}
                    className="flex-1 p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    title="View Details"
                  >
                    <Info size={16} />
                    <span className="text-sm font-semibold">Details</span>
                  </button>
                  <button
                    onClick={() => handleEdit(item._id)}
                    className="flex-1 p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm font-semibold"
                    title="Edit Ingredient"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Ingredient"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIngredient && (
        <IngredientDetailsModal
          selectedIngredient={selectedIngredient}
          setSelectedIngredient={setSelectedIngredient}
        />
      )}
    </PageContainer>
  );
};

export default ViewIngredients;
