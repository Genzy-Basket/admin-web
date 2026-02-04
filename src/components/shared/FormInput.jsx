const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  icon: Icon,
  className = "",
  vPadding = "py-3",
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
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 ${vPadding} border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none`}
      />
    </div>
  );
};

export default FormInput;
