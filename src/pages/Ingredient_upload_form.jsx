import React, { useState } from "react";
import axios from "axios";

const IngredientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "gram",
    pricePerUnit: "",
    category: "vegitables",
    isVeg: true,
    imageUrl: "", // Added image URL field
  });

  const [rawJson, setRawJson] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const units = [
    "gram",
    "kg",
    "ml",
    "litre",
    "piece",
    "packet",
    "dozen",
    "bunch",
  ];
  const categories = [
    "vegitables",
    "meat",
    "fruites",
    "dairy",
    "coconut products",
    "egg",
    "snacks",
    "Bakery",
    "Oils",
    "Pulses",
    "Rice & Grains",
    "Flours",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select a file first");

    setUploading(true);
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "your_preset_name"); // If using Cloudinary

    try {
      // Replace with your actual upload endpoint (Cloudinary, S3, or your API)
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        data
      );
      setFormData((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
      alert("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error", err);
      alert("Image upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const handleJsonPaste = (e) => {
    const value = e.target.value;
    setRawJson(value);
    try {
      let cleaned = value.trim();
      if (cleaned.endsWith(",")) cleaned = cleaned.slice(0, -1);
      const parsed = new Function(`return ${cleaned}`)();

      if (parsed && typeof parsed === "object") {
        let normalizedUnit = parsed.unit ? parsed.unit.toLowerCase() : "gram";
        if (normalizedUnit === "liter") normalizedUnit = "litre";

        let normalizedCat = parsed.category
          ? parsed.category.toLowerCase()
          : "vegitables";
        if (normalizedCat === "fruits") normalizedCat = "fruites";

        setFormData({
          name: parsed.name || "",
          unit: units.includes(normalizedUnit) ? normalizedUnit : "gram",
          pricePerUnit: parsed.pricePerQty || parsed.pricePerUnit || "",
          category: categories
            .map((c) => c.toLowerCase())
            .includes(normalizedCat)
            ? normalizedCat
            : "vegitables",
          isVeg: parsed.isVeg !== undefined ? parsed.isVeg : true,
          imageUrl: parsed.imageUrl || "", // Map imageUrl from JSON if present
        });
      }
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/ingredients", formData);
      alert("Ingredient added successfully!");
      setRawJson("");
      setFormData({
        name: "",
        unit: "gram",
        pricePerUnit: "",
        category: "vegitables",
        isVeg: true,
        imageUrl: "",
      });
      setImageFile(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Upload failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
        {/* LEFT SIDE: INPUT BOX */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-xs">
              JSON
            </span>
            Smart Import
          </h3>
          <textarea
            placeholder="Paste object here..."
            className="w-full h-96 bg-slate-50 text-slate-800 font-mono text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            value={rawJson}
            onChange={handleJsonPaste}
          />
        </div>

        {/* RIGHT SIDE: THE FORM */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-2">
            Verified Data
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Section */}
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Ingredient Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploading || !imageFile}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:bg-slate-300 transition-all"
                >
                  {uploading ? "..." : "Upload"}
                </button>
              </div>
              {formData.imageUrl && (
                <p className="mt-2 text-[10px] text-emerald-600 font-mono break-all truncate">
                  URL: {formData.imageUrl}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="pricePerUnit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Unit
              </label>
              <div className="grid grid-cols-4 gap-2">
                {units.map((u) => (
                  <label key={u} className="cursor-pointer">
                    <input
                      type="radio"
                      name="unit"
                      value={u}
                      checked={formData.unit === u}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="py-2 text-center text-[10px] border border-slate-200 rounded peer-checked:bg-indigo-600 peer-checked:text-white transition-all uppercase">
                      {u}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <label key={cat} className="cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={formData.category === cat}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="p-2 text-center text-[10px] border border-slate-200 rounded peer-checked:bg-indigo-100 peer-checked:text-indigo-700 peer-checked:border-indigo-300 capitalize transition-all">
                      {cat}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800">
                VEGETARIAN
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Upload to MongoDB
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IngredientForm;
