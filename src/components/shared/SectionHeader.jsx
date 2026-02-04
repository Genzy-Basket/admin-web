const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  count,
  action,
  size = "md",
  uppercase = false,
}) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={size === "3xl" ? 28 : size === "2xl" ? 24 : 16}
            className="text-slate-400"
          />
        )}
        <div>
          <h2
            className={`font-black tracking-tight ${sizeClasses[size]} ${
              uppercase ? "uppercase" : ""
            }`}
          >
            {title}
            {count !== undefined && ` (${count})`}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;
