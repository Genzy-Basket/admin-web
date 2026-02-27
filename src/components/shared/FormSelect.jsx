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
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 ${vPadding} border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009661]/30 focus:border-[#009661] outline-none bg-white transition-all appearance-none cursor-pointer text-sm ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {options.map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FormSelect;
