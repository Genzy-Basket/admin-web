const ProgressBar = ({
  progress,
  variant = "primary",
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const variantClasses = {
    primary: {
      bg: "bg-orange-100",
      fill: "bg-orange-500",
    },
    secondary: {
      bg: "bg-emerald-100",
      fill: "bg-emerald-500",
    },
    success: {
      bg: "bg-emerald-100",
      fill: "bg-emerald-500",
    },
    danger: {
      bg: "bg-rose-100",
      fill: "bg-rose-500",
    },
  };

  const sizeClasses = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const config = variantClasses[variant];

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-slate-600">Progress</span>
          <span className="text-xs font-bold text-slate-700">{progress}%</span>
        </div>
      )}
      <div className={`w-full ${config.bg} rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${config.fill} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
