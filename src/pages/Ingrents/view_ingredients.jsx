// import { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";
// import { ingredientApi } from "../../api/ingredientApi";
// import { useIngredients } from "../../context/IngredientsContext";
// import { PageContainer, Badge, ActionButtons } from "../components/shared";
// import {
//   Table,
//   TableHeader,
//   TableHeaderCell,
//   TableBody,
//   TableRow,
//   TableCell,
// } from "../components/shared/Table";

// const ViewIngredients = () => {
//   const { ingredients, loading, refreshIngredients } = useIngredients();
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({});

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this?")) return;
//     try {
//       await ingredientApi.delete(id);
//       await refreshIngredients();
//     } catch (err) {
//       console.log(err);
//       alert("Delete failed");
//     }
//   };

//   const startEdit = (item) => {
//     setEditingId(item._id);
//     setEditForm({ ...item });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditForm({});
//   };

//   const handleUpdate = async () => {
//     try {
//       await ingredientApi.update(editingId, editForm);
//       await refreshIngredients();
//       setEditingId(null);
//       setEditForm({});
//       alert("Updated successfully!");
//     } catch (err) {
//       console.log(err);
//       alert("Update failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-10 text-center font-bold">Loading Inventory...</div>
//     );
//   }

//   return (
//     <PageContainer maxWidth="6xl" gradient="slate">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-black text-slate-800">
//           Inventory Management
//         </h1>
//         <Badge variant="info" size="lg">
//           {ingredients.length} Total Items
//         </Badge>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableHeaderCell>Ingredient</TableHeaderCell>
//           <TableHeaderCell>Category</TableHeaderCell>
//           <TableHeaderCell>Price / Unit</TableHeaderCell>
//           <TableHeaderCell>Status</TableHeaderCell>
//           <TableHeaderCell align="right">Actions</TableHeaderCell>
//         </TableHeader>

//         <TableBody>
//           {ingredients.map((item) => (
//             <TableRow key={item._id}>
//               {/* Name & Image */}
//               <TableCell>
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={item.imageUrl}
//                     alt=""
//                     className="w-10 h-10 rounded-lg object-cover bg-slate-100"
//                   />
//                   <div>
//                     {editingId === item._id ? (
//                       <input
//                         className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
//                         value={editForm.name}
//                         onChange={(e) =>
//                           setEditForm({ ...editForm, name: e.target.value })
//                         }
//                       />
//                     ) : (
//                       <p className="font-bold text-slate-700">{item.name}</p>
//                     )}
//                     <p className="text-[10px] text-slate-400 uppercase font-mono">
//                       {item._id}
//                     </p>
//                   </div>
//                 </div>
//               </TableCell>

//               {/* Category */}
//               <TableCell>
//                 <Badge variant="secondary" size="sm">
//                   {item.category}
//                 </Badge>
//               </TableCell>

//               {/* Price & Unit */}
//               <TableCell>
//                 <div className="flex items-center gap-1 text-sm">
//                   <span className="text-slate-400 font-medium">Rs.</span>
//                   {editingId === item._id ? (
//                     <input
//                       type="number"
//                       className="w-20 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
//                       value={editForm.pricePerUnit}
//                       onChange={(e) =>
//                         setEditForm({
//                           ...editForm,
//                           pricePerUnit: e.target.value,
//                         })
//                       }
//                     />
//                   ) : (
//                     <span className="font-bold text-slate-700">
//                       {item.pricePerUnit}
//                     </span>
//                   )}
//                   <span className="text-slate-400">/ {item.unit}</span>
//                 </div>
//               </TableCell>

//               {/* Status */}
//               <TableCell>
//                 <button
//                   className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded ${
//                     item.isHidden
//                       ? "bg-amber-50 text-amber-600"
//                       : "bg-emerald-50 text-emerald-600"
//                   }`}
//                 >
//                   {item.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
//                   {item.isHidden ? "Hidden" : "Active"}
//                 </button>
//               </TableCell>

//               {/* Actions */}
//               <TableCell>
//                 <ActionButtons
//                   isEditing={editingId === item._id}
//                   onEdit={() => startEdit(item)}
//                   onDelete={() => handleDelete(item._id)}
//                   onSave={handleUpdate}
//                   onCancel={cancelEdit}
//                 />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </PageContainer>
//   );
// };

// export default ViewIngredients;
import { useState } from "react";
import { Eye, EyeOff, X, Info, DollarSign, Package, Tag } from "lucide-react";
import { ingredientApi } from "../../api/ingredientApi";
import { useIngredients } from "../../context/IngredientsContext";
import { PageContainer, Badge, ActionButtons } from "../components/shared";
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../components/shared/Table";

const ViewIngredients = () => {
  const { ingredients, loading, refreshIngredients } = useIngredients();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedIngredient, setSelectedIngredient] = useState(null);

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
      <div className="p-10 text-center font-bold">Loading Inventory...</div>
    );
  }

  return (
    <PageContainer maxWidth="6xl" gradient="slate">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          Inventory Management
        </h1>
        <Badge variant="info" size="lg">
          {ingredients.length} Total Items
        </Badge>
      </div>

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
              {/* Name & Image */}
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

              {/* Category */}
              <TableCell>
                <Badge variant="secondary" size="sm">
                  {item.category}
                </Badge>
              </TableCell>

              {/* Price & Unit */}
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-slate-400 font-medium">Rs.</span>
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

              {/* Status */}
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

              {/* Actions */}
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

      {/* Ingredient Details Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header with Image */}
            <div className="relative h-56 bg-gradient-to-br from-indigo-500 to-purple-600">
              {selectedIngredient.imageUrl ? (
                <img
                  src={selectedIngredient.imageUrl}
                  alt={selectedIngredient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={80} className="text-white/50" />
                </div>
              )}
              <button
                onClick={() => setSelectedIngredient(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
              >
                <X size={24} className="text-gray-700" />
              </button>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4">
                <span
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-lg ${
                    selectedIngredient.isHidden
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {selectedIngredient.isHidden ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                  {selectedIngredient.isHidden ? "Hidden" : "Active"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-14rem)]">
              {/* Title */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedIngredient.name}
                </h2>
                <p className="text-sm text-gray-500 font-mono">
                  ID: {selectedIngredient._id}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Category */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="text-indigo-600" size={20} />
                    <span className="text-xs font-bold text-indigo-900 uppercase">
                      Category
                    </span>
                  </div>
                  <p className="text-lg font-bold text-indigo-700">
                    {selectedIngredient.category}
                  </p>
                </div>

                {/* Price */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-green-600" size={20} />
                    <span className="text-xs font-bold text-green-900 uppercase">
                      Price
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    ₹{selectedIngredient.pricePerUnit}
                    <span className="text-sm font-normal text-green-600">
                      {" "}
                      / {selectedIngredient.unit}
                    </span>
                  </p>
                </div>

                {/* Unit */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-orange-600" size={20} />
                    <span className="text-xs font-bold text-orange-900 uppercase">
                      Unit of Measure
                    </span>
                  </div>
                  <p className="text-lg font-bold text-orange-700">
                    {selectedIngredient.unit}
                  </p>
                </div>

                {/* Visibility */}
                <div
                  className={`p-4 rounded-xl border ${
                    selectedIngredient.isHidden
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
                      : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedIngredient.isHidden ? (
                      <EyeOff className="text-amber-600" size={20} />
                    ) : (
                      <Eye className="text-emerald-600" size={20} />
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
                    className={`text-lg font-bold ${
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
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
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
