const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full text-slate-400 py-12 ${className}`}
    >
      {Icon && <Icon size={48} className="mb-3 opacity-30" />}
      {title && <p className="text-sm font-semibold text-slate-600">{title}</p>}
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
