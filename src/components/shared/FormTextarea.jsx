const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  icon: Icon,
  className = "",
  monospace = false,
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
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
          monospace ? "font-mono text-sm" : ""
        }`}
      />
    </div>
  );
};

export default FormTextarea;
