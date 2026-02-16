const PageContainer = ({
  children,
  title,
  icon: Icon,
  maxWidth = "7xl",
  gradient = "orange",
  className = "",
}) => {
  const gradientClasses = {
    orange: "from-orange-50 to-amber-50",
    blue: "from-blue-50 to-indigo-50",
    green: "from-green-50 to-emerald-50",
    purple: "from-purple-50 to-pink-50",
    slate: "from-slate-50 via-indigo-50 to-slate-100",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`min-h-screen  ${gradientClasses[gradient]} p-3 sm:p-6 lg:p-8${className}`}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {title && (
          <div className="flex items-center gap-3 mb-6">
            {Icon && <Icon size={32} className="text-orange-600" />}
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
