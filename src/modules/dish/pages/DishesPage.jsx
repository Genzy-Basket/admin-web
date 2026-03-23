// src/modules/dish/pages/DishesPage.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, X } from "lucide-react";
import { useDish } from "../context/DishContext";
import { PageContainer, Button } from "../../../components/shared";
import { usePageMeta } from "../../../context/PageHeaderContext";
import { MEAL_TYPES, CUISINES } from "../../../constants";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";

const DishesPage = () => {
  const navigate = useNavigate();
  const { dishes, loading, fetchDishes } = useDish();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [vegFilter, setVegFilter] = useState(null);
  const [cuisineFilter, setCuisineFilter] = useState(null);
  const [mealTypeFilter, setMealTypeFilter] = useState(null);
  const filterRef = useRef(null);

  const handleRefresh = useCallback(async () => {
    await fetchDishes({});
  }, [fetchDishes]);

  usePageMeta({
    title: "Dishes",
    onRefresh: handleRefresh,
    fab: {
      label: "Add Dish",
      icon: Plus,
      onClick: () => navigate("/dishes/add"),
    },
  });

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => {
      const matchesSearch =
        !searchTerm ||
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.dietaryTags?.some((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesVeg = vegFilter === null || d.isVeg === vegFilter;
      const matchesCuisine = !cuisineFilter || d.cuisine === cuisineFilter;
      const matchesMealType =
        !mealTypeFilter || d.mealTypes?.includes(mealTypeFilter);
      return matchesSearch && matchesVeg && matchesCuisine && matchesMealType;
    });
  }, [dishes, searchTerm, vegFilter, cuisineFilter, mealTypeFilter]);

  const activeFilterCount =
    (vegFilter !== null ? 1 : 0) +
    (cuisineFilter ? 1 : 0) +
    (mealTypeFilter ? 1 : 0);

  const clearFilters = () => {
    setVegFilter(null);
    setCuisineFilter(null);
    setMealTypeFilter(null);
  };

  return (
    <PageContainer>
      <div className="hidden sm:flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-slate-800">Dishes</h1>
        <Button
          onClick={() => navigate("/dishes/add")}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Dish
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-6" ref={filterRef}>
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search dishes..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`h-full px-3 rounded-xl border transition-colors flex items-center gap-1.5 ${
              activeFilterCount > 0
                ? "bg-[#099E0E] border-[#099E0E] text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="text-xs font-bold">{activeFilterCount}</span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#099E0E] hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Veg / Non-veg */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Type
                </p>
                <div className="flex gap-2">
                  {[
                    { label: "Veg", value: true },
                    { label: "Non-Veg", value: false },
                  ].map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() =>
                        setVegFilter((prev) => (prev === value ? null : value))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        vegFilter === value
                          ? value
                            ? "bg-green-600 border-green-600 text-white"
                            : "bg-red-500 border-red-500 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Cuisine
                </p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {CUISINES.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setCuisineFilter((prev) => (prev === c ? null : c))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        cuisineFilter === c
                          ? "bg-[#099E0E] border-[#099E0E] text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Type */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Meal Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setMealTypeFilter((prev) => (prev === m ? null : m))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        mealTypeFilter === m
                          ? "bg-[#099E0E] border-[#099E0E] text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400">
          Loading dishes...
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold">No dishes found</p>
          <p className="text-sm text-slate-400 mt-1">
            {dishes.length === 0
              ? "Create your first dish to get started"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish._id}
              dish={dish}
              onView={setSelectedDish}
            />
          ))}
        </div>
      )}

      <DishModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
      />
    </PageContainer>
  );
};

export default DishesPage;
