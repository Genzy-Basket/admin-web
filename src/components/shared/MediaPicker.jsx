import { useRef } from "react";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";

const MediaPicker = ({ imagePreview, imageFile, onFileSelect, onRemove }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    onFileSelect(file);
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {imagePreview ? (
        <div className="relative group">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-2xl border-2 border-slate-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-semibold truncate max-w-[200px]">
            {imageFile?.name}
          </div>
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center cursor-pointer hover:border-[#099E0E] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file"
            className="cursor-pointer flex flex-col items-center py-4"
          >
            <Image className="mb-2 text-slate-400" size={32} />
            <span className="text-xs font-bold text-slate-600">
              Click to select image
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Max 5MB • JPG, PNG, WebP
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default MediaPicker;
