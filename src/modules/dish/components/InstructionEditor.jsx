// src/modules/dish/components/InstructionEditor.jsx
import { Plus, X, GripVertical } from "lucide-react";

const InstructionEditor = ({ instructions, onChange }) => {
  const updateStep = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    onChange(updated);
  };

  const addStep = () => {
    onChange([...instructions, ""]);
  };

  const removeStep = (index) => {
    if (instructions.length <= 1) return;
    onChange(instructions.filter((_, i) => i !== index));
  };

  const moveStep = (from, to) => {
    if (to < 0 || to >= instructions.length) return;
    const updated = [...instructions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {instructions.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col items-center gap-0.5 pt-2">
            <button
              type="button"
              onClick={() => moveStep(i, i - 1)}
              disabled={i === 0}
              className="text-slate-300 hover:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <GripVertical size={14} />
            </button>
          </div>
          <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-[#099E0E] text-white text-xs font-bold rounded-full mt-1.5">
            {i + 1}
          </span>
          <textarea
            value={step}
            onChange={(e) => updateStep(i, e.target.value)}
            placeholder={`Step ${i + 1}...`}
            rows={2}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none resize-none"
          />
          {instructions.length > 1 && (
            <button
              type="button"
              onClick={() => removeStep(i)}
              className="p-1.5 mt-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="flex items-center gap-2 text-sm font-semibold text-[#099E0E] hover:text-[#078A0C] transition-colors"
      >
        <Plus size={16} /> Add Step
      </button>
    </div>
  );
};

export default InstructionEditor;
