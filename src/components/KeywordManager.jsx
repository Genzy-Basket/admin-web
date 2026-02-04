import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, FormInput } from "./shared";

/**
 * Reusable component for managing keywords
 * @param {Array} keywords - Array of keywords
 * @param {Function} onAdd - Callback to add a keyword (keyword)
 * @param {Function} onRemove - Callback to remove a keyword (index)
 * @param {Function} onUpdate - Optional callback to update a keyword (index, value)
 * @param {boolean} editable - Whether keywords can be edited inline
 */
const KeywordManager = ({
  keywords = [],
  onAdd,
  onRemove,
  onUpdate = null,
  editable = false,
}) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase">
        Keywords (Optional)
      </label>

      {/* Input field */}
      <div className="flex gap-2">
        <FormInput
          placeholder="Add keyword"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Keywords display */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          {editable ? (
            // Editable mode (for update page)
            keywords.map((keyword, index) => (
              <div key={index} className="flex gap-2">
                <FormInput
                  value={keyword}
                  onChange={(e) => onUpdate?.(index, e.target.value)}
                  placeholder="Enter keyword"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            // Display mode (for create page)
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="hover:text-indigo-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordManager;
