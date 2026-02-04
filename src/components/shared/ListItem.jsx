import { X } from "lucide-react";

const ListItem = ({
  image,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  onRemove,
  variant = "default",
  className = "",
}) => {
  const variantClasses = {
    default: "bg-white border-slate-200",
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-rose-50 border-rose-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-indigo-50 border-indigo-200",
  };

  return (
    <div
      className={`
        flex items-center gap-4
        p-3 rounded-xl border shadow-sm
        transition-all
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Left Slot */}
      {leftSlot && <div className="flex-shrink-0">{leftSlot}</div>}

      {/* Image */}
      {image && (
        <img
          src={image}
          alt=""
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-bold text-slate-800 text-sm truncate">{title}</p>
        )}
        {subtitle && (
          <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
        )}
      </div>

      {/* Right Slot */}
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}

      {/* Remove Button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default ListItem;
