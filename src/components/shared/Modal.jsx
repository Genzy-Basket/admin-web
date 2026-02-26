import { useEffect } from "react";
import { createPortal } from "react-dom";
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
  // Lock the scrollable <main> element while open
  useEffect(() => {
    if (!isOpen) return;
    const main = document.querySelector("main");
    if (main) main.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${sizeClasses[size]} max-h-[92dvh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl rounded-t-2xl sm:rounded-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
            <h2 className="font-bold text-lg text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t bg-slate-50 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
