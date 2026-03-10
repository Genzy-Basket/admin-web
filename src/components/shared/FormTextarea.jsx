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
        <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-1.5">
          {Icon && <Icon size={14} className="text-slate-400" />}
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#099E0E]/30 focus:border-[#099E0E] outline-none resize-none transition-all text-sm ${
          monospace ? "font-mono" : ""
        }`}
      />
    </div>
  );
};

export default FormTextarea;
