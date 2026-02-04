import { X } from "lucide-react";

const Badge = ({
  children,
  variant = "primary",
  size = "md",
  removable = false,
  onRemove,
  className = "",
}) => {
  const variantClasses = {
    primary: "bg-orange-500 text-white",
    secondary: "bg-slate-100 text-slate-700",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-rose-500 text-white",
    info: "bg-blue-500 text-white",
    outline: "bg-white border-2 border-orange-500 text-orange-700",
  };

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-xs px-3 py-1.5",
    lg: "text-sm px-4 py-2",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-bold rounded-full shadow-sm
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X size={size === "xs" || size === "sm" ? 10 : 12} />
        </button>
      )}
    </span>
  );
};

export default Badge;
