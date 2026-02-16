// src/modules/product/pages/ProductsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useProduct } from "../context/ProductContext";
import { PageContainer, Button } from "../../../components/shared";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, loading, fetchProducts } = useProduct();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PageContainer>
      <div className="flex flex-wrap sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-slate-800">Products</h1>
        <Button
          onClick={() => navigate("/products/add")}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <div className="relative mb-6">
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
