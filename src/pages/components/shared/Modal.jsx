import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[80vh] overflow-hidden flex flex-col shadow-2xl ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-lg text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-4 flex-1">{children}</div>

        {/* Footer */}
        {footer && <div className="p-4 border-t bg-slate-50">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
