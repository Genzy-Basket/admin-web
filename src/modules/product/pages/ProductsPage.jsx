import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, X } from "lucide-react";
import { useProduct } from "../context/ProductContext";
import { PageContainer, Button } from "../../../components/shared";
import { usePageMeta } from "../../../context/PageHeaderContext";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, loading, fetchProducts } = useProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [vegFilter, setVegFilter] = useState(null); // null | true | false
  const [categoryFilter, setCategoryFilter] = useState(null); // null | string
  const filterRef = useRef(null);

  const handleRefresh = useCallback(async () => {
    await fetchProducts({}, true);
  }, [fetchProducts]);

  usePageMeta({
    title: "Inventory",
    onRefresh: handleRefresh,
    fab: {
      label: "Add Product",
      icon: Plus,
      onClick: () => navigate("/products/add"),
    },
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Close filter panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVeg = vegFilter === null || p.isVeg === vegFilter;
    const matchesCategory = categoryFilter === null || p.category === categoryFilter;
    return matchesSearch && matchesVeg && matchesCategory;
  });

  const activeFilterCount =
    (vegFilter !== null ? 1 : 0) + (categoryFilter !== null ? 1 : 0);

  const clearFilters = () => {
    setVegFilter(null);
    setCategoryFilter(null);
  };

  return (
    <PageContainer>
      {/* Desktop: title + add-product button. On mobile the FAB handles this. */}
      <div className="hidden sm:flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-slate-800">Products</h1>
        <Button
          onClick={() => navigate("/products/add")}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </Button>
      </div>

      {/* Search + Filter row */}
      <div className="flex gap-2 mb-6" ref={filterRef}>
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`h-full px-3 rounded-xl border transition-colors flex items-center gap-1.5 ${
              activeFilterCount > 0
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="text-xs font-bold">{activeFilterCount}</span>
            )}
          </button>

          {/* Filter dropdown panel */}
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
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

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setCategoryFilter((prev) =>
                            prev === cat ? null : cat,
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          categoryFilter === cat
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400">
          Loading catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onView={setSelectedProduct}
            />
          ))}
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </PageContainer>
  );
};

export default ProductsPage;
