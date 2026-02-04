const Card = ({
  children,
  className = "",
  padding = "md",
  rounded = "2xl",
  shadow = "sm",
  border = true,
}) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    "2xl": "rounded-[32px]",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  return (
    <div
      className={`
        bg-white
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${shadowClasses[shadow]}
        ${border ? "border border-slate-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
