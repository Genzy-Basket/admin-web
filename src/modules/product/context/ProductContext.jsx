// src/modules/product/context/ProductContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { productApi } from "../../../api/endpoints/product.api";
import { mediaApi } from "../../../api/endpoints/media.api";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // src/modules/product/context/ProductContext.jsx

  const fetchProducts = useCallback(
    async (filters = {}, force = false) => {
      if (!force && products.length > 0) return;

      setLoading(true);
      try {
        const response = await productApi.getAll(filters);
        setProducts(response.data || []);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [products.length],
  );

  const addProduct = async (file, itemData) => {
    setLoading(true);
    try {
      let imageUrl = itemData.imageUrl;
      if (file) imageUrl = await mediaApi.uploadToCloudinary(file);

      const response = await productApi.add({ ...itemData, imageUrl });
      setProducts((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, updateData, file = null) => {
    setLoading(true);
    try {
      let imageUrl = updateData.imageUrl;
      if (file) imageUrl = await mediaApi.uploadToCloudinary(file);

      const response = await productApi.update(id, { ...updateData, imageUrl });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? response.data : p)),
      );
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProductById = useCallback(
    async (id) => {
      // Check local cache
      const localProduct = products.find((p) => p._id === id);
      if (localProduct) return localProduct;

      // Otherwise fetch
      setLoading(true);
      try {
        const response = await productApi.getById(id);
        return response.data;
      } finally {
        setLoading(false);
      }
    },
    [products],
  );

  const deleteProduct = async (id) => {
    setLoading(true); // Always toggle loading for consistency
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      return true;
    } catch (err) {
      setError("Failed to delete product");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
