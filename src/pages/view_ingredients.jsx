import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Eye, EyeOff, Save, X } from "lucide-react"; // Using lucide-react for icons
import { ingredientApi } from "../api/ingredientApi";

const ViewIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await ingredientApi.getAll();
      setIngredients(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await ingredientApi.delete(id);
      setIngredients(ingredients.filter((item) => item._id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ ...item });
  };

  const handleUpdate = async () => {
    try {
      setIngredients(
        ingredients.map((img) => (img._id === editingId ? editForm : img))
      );
      setEditingId(null);
      alert("Updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold">Loading Inventory...</div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">
            Inventory Management
          </h1>
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold">
            {ingredients.length} Total Items
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
                <th className="px-6 py-4">Ingredient</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price / Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ingredients.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Name & Image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
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
                          <p className="font-bold text-slate-700">
                            {item.name}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 uppercase font-mono">
                          {item._id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 capitalize">
                      {item.category}
                    </span>
                  </td>

                  {/* Price & Unit */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-slate-400 font-medium">Rs.</span>
                      {editingId === item._id ? (
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
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
                  </td>

                  {/* Toggle Hide/Show */}
                  <td className="px-6 py-4">
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
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === item._id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewIngredients;
