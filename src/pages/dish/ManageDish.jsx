import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Clock,
  Flame,
  Leaf,
  X,
  ChefHat,
} from "lucide-react";
import {
  PageContainer,
  Card,
  Button,
  SectionHeader,
  ListItem,
} from "../../components/shared";
import { dishApi } from "../../api/dishApi";

function ManageDish() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [filters, setFilters] = useState({
    isVeg: undefined,
    maxPrepTime: "",
    maxCalories: "",
    dietaryTags: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const activeFilters = {};

      if (filters.isVeg !== undefined) activeFilters.isVeg = filters.isVeg;
      if (filters.maxPrepTime) activeFilters.maxPrepTime = filters.maxPrepTime;
      if (filters.maxCalories) activeFilters.maxCalories = filters.maxCalories;
      if (filters.dietaryTags.length > 0)
        activeFilters.dietaryTags = filters.dietaryTags;

      const response = await dishApi.getAll(activeFilters);
      setDishes(response.data || []);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      alert("Failed to fetch dishes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchDishes();
      return;
    }

    try {
      setLoading(true);
      const response = await dishApi.search(searchTerm);
      setDishes(response.data || []);
    } catch (error) {
      console.error("Error searching dishes:", error);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await dishApi.delete(id);
      alert("Dish deleted successfully");
      fetchDishes();
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Failed to delete dish");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchDishes();
  };

  const clearFilters = () => {
    setFilters({
      isVeg: undefined,
      maxPrepTime: "",
      maxCalories: "",
      dietaryTags: [],
    });
    setSearchTerm("");
    fetchDishes();
  };

  const filteredDishes = searchTerm ? dishes : dishes;

  return (
    <PageContainer
      title="Manage Dishes"
      icon={UtensilsCrossed}
      gradient="orange"
    >
      <Card padding="lg">
        <div className="space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search dishes by title..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    value={filters.isVeg === undefined ? "" : filters.isVeg}
                    onChange={(e) =>
                      handleFilterChange(
                        "isVeg",
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All</option>
                    <option value="true">Vegetarian</option>
                    <option value="false">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Prep Time (min)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrepTime}
                    onChange={(e) =>
                      handleFilterChange("maxPrepTime", e.target.value)
                    }
                    placeholder="e.g., 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Calories
                  </label>
                  <input
                    type="number"
                    value={filters.maxCalories}
                    onChange={(e) =>
                      handleFilterChange("maxCalories", e.target.value)
                    }
                    placeholder="e.g., 500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button variant="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <SectionHeader
            title="All Dishes"
            count={filteredDishes.length}
            size="sm"
          />

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading dishes...
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No dishes found
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {filteredDishes.map((dish) => (
                <ListItem
                  key={dish._id}
                  image={dish.imageUrl}
                  title={dish.title}
                  subtitle={
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {dish.prepTimeMinutes} min
                      </span>
                      {dish.calories && (
                        <span className="flex items-center gap-1">
                          <Flame size={14} />
                          {dish.calories} cal
                        </span>
                      )}
                      {dish.isVeg && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Leaf size={14} />
                          Veg
                        </span>
                      )}
                    </div>
                  }
                  badges={dish.dietaryTags?.slice(0, 3).map((tag) => ({
                    label: tag,
                    variant: "outline",
                  }))}
                  rightSlot={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDish(dish)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => alert(`Edit ${dish.title}`)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(dish._id, dish.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Dish Details Modal */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header with Image */}
            <div className="relative h-64 bg-linear-to-br from-orange-400 to-orange-600">
              {selectedDish.imageUrl ? (
                <img
                  src={selectedDish.imageUrl}
                  alt={selectedDish.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat size={80} className="text-white/50" />
                </div>
              )}
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
              {/* Title and Stats */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {selectedDish.title}
                </h2>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg font-medium">
                    <Clock size={16} />
                    {selectedDish.prepTimeMinutes} min
                  </span>
                  {selectedDish.calories && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium">
                      <Flame size={16} />
                      {selectedDish.calories} cal
                    </span>
                  )}
                  {selectedDish.isVeg && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium">
                      <Leaf size={16} />
                      Vegetarian
                    </span>
                  )}
                </div>

                {/* Dietary Tags */}
                {selectedDish.dietaryTags &&
                  selectedDish.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedDish.dietaryTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Ingredients */}
              {selectedDish.ingredients &&
                selectedDish.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Ingredients
                    </h3>
                    <div className="space-y-2">
                      {selectedDish.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          {ing.ingredientId?.imageUrl && (
                            <img
                              src={ing.ingredientId.imageUrl}
                              alt={ing.ingredientId.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {ing.ingredientId?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {ing.quantity} {ing.ingredientId?.unit}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">
                            {ing.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Instructions */}
              {selectedDish.instructions &&
                selectedDish.instructions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Instructions
                    </h3>
                    <div className="space-y-3">
                      {selectedDish.instructions.map((instruction, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white font-bold rounded-lg shadow-sm">
                            {idx + 1}
                          </div>
                          <p className="flex-1 text-gray-700 leading-relaxed pt-1">
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default ManageDish;
