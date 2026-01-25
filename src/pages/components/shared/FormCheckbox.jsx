const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  className = "",
  checkboxColor = "green",
}) => {
  const colorClasses = {
    green: "text-green-600 focus:ring-green-500",
    orange: "text-orange-600 focus:ring-orange-500",
    blue: "text-blue-600 focus:ring-blue-500",
    indigo: "text-indigo-600 focus:ring-indigo-500",
  };

  return (
    <div className={className}>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className={`w-5 h-5 rounded focus:ring-2 ${colorClasses[checkboxColor]}`}
        />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default FormCheckbox;
