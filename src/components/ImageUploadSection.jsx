import React from "react";
import { Upload, X } from "lucide-react";
import { Card, FormInput } from "./shared";

/**
 * Reusable image upload section component
 * @param {string} imagePreview - Preview URL for the image
 * @param {File} imageFile - The selected image file
 * @param {string} imageUrl - Fallback image URL
 * @param {Function} onImageChange - Callback when image is selected (file)
 * @param {Function} onRemoveImage - Callback to remove image
 * @param {Function} onImageUrlChange - Callback when image URL changes (url)
 */
const ImageUploadSection = ({
  imagePreview,
  imageFile,
  imageUrl = "",
  onImageChange,
  onRemoveImage,
  onImageUrlChange,
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    onImageChange(file);
  };

  return (
    <Card padding="md" rounded="xl">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        Ingredient Image
      </h2>

      <div className="space-y-4">
        {/* Current/Preview Image */}
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-48 h-48 rounded-lg object-cover border-2 border-slate-200"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/200?text=Image+Error";
              }}
            />
            {imageFile && (
              <>
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  title="Remove new image"
                >
                  <X size={16} />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                  New Image
                </span>
              </>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#099E0E] hover:bg-[#078A0C] text-white rounded-lg font-semibold cursor-pointer transition-colors">
            <Upload size={18} />
            {imageFile ? "Change Image" : "Upload New Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500 mt-2">
            Supported formats: JPG, PNG, WebP (Max 5MB)
          </p>
        </div>

        {/* Image URL Fallback */}
        <div>
          <FormInput
            type="url"
            label="Or use Image URL"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </Card>
  );
};

export default ImageUploadSection;
