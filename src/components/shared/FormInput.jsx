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
  vPadding = "py-2.5",
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1.5">
          {Icon && <Icon size={14} className="text-slate-400" />}
          {label}
          {required && <span className="text-rose-500">*</span>}
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
        className={`w-full px-4 ${vPadding} border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009661]/30 focus:border-[#009661] outline-none transition-all text-sm`}
      />
    </div>
  );
};

export default FormInput;
