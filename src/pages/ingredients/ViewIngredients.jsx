import { useState, useEffect } from "react";
import { Eye, EyeOff, X, Info, DollarSign, Package, Tag } from "lucide-react";
import { ingredientApi } from "../../api/ingredientApi";
import { useIngredients } from "../../context/IngredientsContext";
import { PageContainer, Badge, ActionButtons } from "../../components/shared";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/shared/Table";

const ViewIngredients = () => {
  const { ingredients, loading, refreshIngredients } = useIngredients();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  useEffect(() => {
    refreshIngredients();
  }, [refreshIngredients]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await ingredientApi.delete(id);
      await refreshIngredients();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    try {
      await ingredientApi.update(editingId, editForm);
      await refreshIngredients();
      setEditingId(null);
      setEditForm({});
      alert("Updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10 text-center font-bold">
        Loading Inventory...
      </div>
    );
  }

  return (
    <PageContainer maxWidth="6xl" gradient="slate">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            Inventory Management
          </h1>
          <Badge variant="info" size="lg">
            {ingredients.length} Items
          </Badge>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {ingredients.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              {/* Header with Image and Name */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all flex-shrink-0"
                  onClick={() => setSelectedIngredient(item)}
                />
                <div className="flex-1 min-w-0">
                  {editingId === item._id ? (
                    <input
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 mb-2"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    <p
                      className="font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors mb-1"
                      onClick={() => setSelectedIngredient(item)}
                    >
                      {item.name}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 uppercase font-mono truncate">
                    {item._id}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Category */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Category
                  </p>
                  <Badge variant="secondary" size="sm">
                    {item.category}
                  </Badge>
                </div>

                {/* Price */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Price / Unit
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-slate-400 font-medium">₹</span>
                    {editingId === item._id ? (
                      <input
                        type="number"
                        className="w-16 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                        value={editForm.pricePerUnit}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            pricePerUnit: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <span className="font-bold text-slate-700">
                        {item.pricePerUnit}
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">
                      / {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <button
                  className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${
                    item.isHidden
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  {item.isHidden ? "Hidden" : "Active"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIngredient(item)}
                  className="flex-1 p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Info size={16} />
                  <span className="text-sm font-semibold">Details</span>
                </button>
                {editingId === item._id ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeaderCell>Ingredient</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Price / Unit</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {ingredients.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                        onClick={() => setSelectedIngredient(item)}
                      />
                      <div>
                        {editingId === item._id ? (
                          <input
                            className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          <p
                            className="font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => setSelectedIngredient(item)}
                          >
                            {item.name}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 uppercase font-mono">
                          {item._id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" size="sm">
                      {item.category}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-slate-400 font-medium">₹</span>
                      {editingId === item._id ? (
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                          value={editForm.pricePerUnit}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              pricePerUnit: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className="font-bold text-slate-700">
                          {item.pricePerUnit}
                        </span>
                      )}
                      <span className="text-slate-400">/ {item.unit}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <button
                      className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded ${
                        item.isHidden
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {item.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      {item.isHidden ? "Hidden" : "Active"}
                    </button>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setSelectedIngredient(item)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Info size={18} />
                      </button>
                      <ActionButtons
                        isEditing={editingId === item._id}
                        onEdit={() => startEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                        onSave={handleUpdate}
                        onCancel={cancelEdit}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Ingredient Details Modal - Responsive */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header with Image */}
            <div className="relative h-48 sm:h-56 bg-gradient-to-br from-indigo-500 to-purple-600">
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

              {/* Status Badge */}
              <div className="absolute bottom-3 left-3">
                <span
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shadow-lg ${
                    selectedIngredient.isHidden
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {selectedIngredient.isHidden ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                  {selectedIngredient.isHidden ? "Hidden" : "Active"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-14rem)]">
              {/* Title */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {selectedIngredient.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-mono break-all">
                  ID: {selectedIngredient._id}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Category */}
                <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="text-indigo-600" size={18} />
                    <span className="text-xs font-bold text-indigo-900 uppercase">
                      Category
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-indigo-700">
                    {selectedIngredient.category}
                  </p>
                </div>

                {/* Price */}
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-green-600" size={18} />
                    <span className="text-xs font-bold text-green-900 uppercase">
                      Price
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-green-700">
                    ₹{selectedIngredient.pricePerUnit}
                    <span className="text-sm font-normal text-green-600">
                      {" "}
                      / {selectedIngredient.unit}
                    </span>
                  </p>
                </div>

                {/* Unit */}
                <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-orange-600" size={18} />
                    <span className="text-xs font-bold text-orange-900 uppercase">
                      Unit of Measure
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-orange-700">
                    {selectedIngredient.unit}
                  </p>
                </div>

                {/* Visibility */}
                <div
                  className={`p-3 sm:p-4 rounded-xl border ${
                    selectedIngredient.isHidden
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
                      : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedIngredient.isHidden ? (
                      <EyeOff className="text-amber-600" size={18} />
                    ) : (
                      <Eye className="text-emerald-600" size={18} />
                    )}
                    <span
                      className={`text-xs font-bold uppercase ${
                        selectedIngredient.isHidden
                          ? "text-amber-900"
                          : "text-emerald-900"
                      }`}
                    >
                      Visibility
                    </span>
                  </div>
                  <p
                    className={`text-base sm:text-lg font-bold ${
                      selectedIngredient.isHidden
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {selectedIngredient.isHidden
                      ? "Hidden from Users"
                      : "Visible to Users"}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedIngredient.description && (
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase">
                    Description
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {selectedIngredient.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ViewIngredients;
