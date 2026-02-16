import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button, FormInput } from "../../../components/shared";

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

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Keywords (Optional)
      </label>

      <div className="flex gap-2">
        <div className="flex-1">
          <FormInput
            placeholder="Add keyword..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          // Added solid indigo background and rounded-xl for modern look
          className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition-colors flex items-center justify-center shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold ring-1 ring-indigo-100"
            >
              {keyword}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-rose-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordManager;
