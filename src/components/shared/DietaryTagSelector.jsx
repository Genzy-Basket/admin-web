import { useState } from "react";
import { Tag, X, ChevronDown, ChevronUp } from "lucide-react";

const DietaryTagsSelector = ({ selectedTags, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allTags = [
    // Meal Types
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "brunch",
    // Dish Types
    "curry",
    "rice",
    "chapati",
    "bread",
    "soup",
    "salad",
    "dessert",
    "beverage",
    // Nutritional
    "high-protein",
    "low-carb",
    "high-fiber",
    "low-fat",
    "gluten-free",
    "dairy-free",
    // Dietary Preferences
    "vegan",
    "keto",
    "paleo",
    // Preparation Style
    "quick-meal",
    "slow-cook",
    "no-cook",
    "one-pot",
    // Cuisine
    "indian",
    "chinese",
    "italian",
    "mexican",
    "thai",
    // Occasion
    "festive",
    "party",
    "comfort-food",
    "street-food",
  ].sort();

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Tag size={16} />
        Dietary Tags ({selectedTags.length})
      </label>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#099E0E] text-white text-xs font-bold rounded-full shadow-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-[#078A0C] rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Selector */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {isExpanded ? "Hide" : "Show"} Available Tags
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#099E0E]/30 focus:border-transparent"
            />

            {/* Tags Grid */}
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all capitalize ${
                        isSelected
                          ? "bg-[#099E0E] text-white border-[#099E0E] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#099E0E]/30 hover:bg-emerald-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {filteredTags.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">
                  No tags found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryTagsSelector;
