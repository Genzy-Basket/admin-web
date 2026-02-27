import { CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";

const StatusIndicator = ({
  status,
  size = "md",
  showText = false,
  customText,
}) => {
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      label: "Success",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-rose-500",
      text: "text-rose-600",
      label: "Error",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-amber-500",
      text: "text-amber-600",
      label: "Warning",
    },
    processing: {
      icon: Loader2,
      bg: "bg-emerald-500",
      text: "text-[#009661]",
      label: "Processing",
      animate: true,
    },
    pending: {
      icon: Clock,
      bg: "bg-slate-100",
      text: "text-slate-400",
      label: "Pending",
    },
    completed: {
      icon: CheckCircle2,
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      label: "Completed",
    },
  };

  const sizeClasses = {
    xs: { container: "w-6 h-6", icon: 12 },
    sm: { container: "w-8 h-8", icon: 14 },
    md: { container: "w-10 h-10", icon: 18 },
    lg: { container: "w-12 h-12", icon: 22 },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  const sizeConfig = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizeConfig.container}
          ${config.bg}
          text-white
          rounded-xl flex items-center justify-center
        `}
      >
        <Icon
          size={sizeConfig.icon}
          className={config.animate ? "animate-spin" : ""}
        />
      </div>
      {showText && (
        <span className={`text-xs font-bold uppercase ${config.text}`}>
          {customText || config.label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
