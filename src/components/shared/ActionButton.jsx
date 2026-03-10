import { Pencil, Trash2, Save, X } from "lucide-react";

const ActionButtons = ({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  className = "",
}) => {
  return (
    <div
      className={`flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
    >
      {isEditing ? (
        <>
          <button
            onClick={onSave}
            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={onCancel}
            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onEdit}
            className="p-2 bg-emerald-50 text-[#099E0E] rounded-lg hover:bg-[#099E0E] hover:text-white transition-all"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
