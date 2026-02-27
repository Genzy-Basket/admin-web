const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
}) => {
  const variantClasses = {
    primary:   "bg-[#009661] text-white hover:bg-[#007d51] shadow-md hover:shadow-lg shadow-[#009661]/20",
    secondary: "bg-white text-[#009661] border-2 border-[#009661]/40 hover:bg-emerald-50",
    danger:    "bg-white text-rose-600 border border-rose-300 hover:bg-rose-50",
    warning:   "bg-white text-amber-600 border border-amber-300 hover:bg-amber-50",
    success:   "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md",
    dark:      "bg-slate-900 text-white hover:bg-slate-800 shadow-xl",
    dashed:    "border-2 border-dashed border-[#009661]/40 text-[#009661] hover:bg-emerald-50 bg-white",
    ghost:     "text-slate-400 hover:text-rose-500",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        font-bold rounded-xl transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {Icon && iconPosition === "left" && <Icon size={16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={16} />}
    </button>
  );
};

export default Button;
