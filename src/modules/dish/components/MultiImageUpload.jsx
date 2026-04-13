import { Upload, X } from "lucide-react";
import { errorBus } from "../../../api/errorBus";

const MultiImageUpload = ({ images = [], onImagesChange, title = "Dish Images", maxImages = 3 }) => {
  // images: array of { url: string, file: File|null, isNew: boolean }
  const totalCount = images.length;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = maxImages - totalCount;
    if (remaining <= 0) {
      errorBus.emit(`Maximum ${maxImages} images allowed`, "error");
      return;
    }

    const validFiles = [];
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        errorBus.emit(`${file.name} is not an image file`, "error");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorBus.emit(`${file.name} exceeds 5MB limit`, "error");
        continue;
      }
      validFiles.push({
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      });
    }

    if (validFiles.length) {
      onImagesChange([...images, ...validFiles]);
    }
    e.target.value = "";
  };

  const handleRemove = (index) => {
    const img = images[index];
    if (img.isNew && img.url.startsWith("blob:")) {
      URL.revokeObjectURL(img.url);
    }
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700">
          {title}
        </h3>
        <span className="text-xs font-bold text-slate-400">
          {totalCount}/{maxImages}
        </span>
      </div>

      <div className="space-y-3">
        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div
                key={img.url + i}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50"
              >
                <img
                  src={img.url}
                  alt={`Dish ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200?text=Error";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-[#099E0E] text-white text-[10px] font-bold rounded">
                    Cover
                  </span>
                )}
                {img.isNew && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {totalCount < maxImages && (
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#099E0E] hover:bg-[#078A0C] text-white rounded-lg font-semibold cursor-pointer transition-colors">
              <Upload size={18} />
              {totalCount === 0 ? "Upload Images" : "Add More"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-500 mt-2">
              {totalCount === 0
                ? `At least 1 image required. Max ${maxImages} images, 5MB each.`
                : `${maxImages - totalCount} more allowed. Max 5MB each.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
