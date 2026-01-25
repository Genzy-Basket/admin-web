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
    primary:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl",
    secondary:
      "bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50",
    danger: "bg-white text-rose-600 border border-rose-300 hover:bg-rose-50",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl",
    dashed:
      "border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 bg-white",
    ghost: "text-slate-400 hover:text-rose-500",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
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
        font-bold rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {Icon && iconPosition === "left" && <Icon size={18} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </button>
  );
};

export default Button;
