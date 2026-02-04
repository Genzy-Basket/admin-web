const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
  className = "",
  capitalize = true,
  vPadding = "py-2",
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon size={14} />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 ${vPadding} border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default FormSelect;
