import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { errorBus } from "../api/errorBus";

const ToastContext = createContext(null);

let nextId = 0;

const STYLES = {
  error:   { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  success: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
  info:    { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
  warning: { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
};

const Toast = ({ toast, onDismiss }) => {
  const style = STYLES[toast.type] ?? STYLES.info;
  return (
    <div
      role="alert"
      style={{
        ...style,
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "0.75rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontSize: "0.875rem",
        lineHeight: "1.4",
        animation: "adminSlideIn 0.2s ease",
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          opacity: 0.6,
          fontSize: "1rem",
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes adminSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const ToastProvider = ({ children, duration = 4000 }) => {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRefs.current[id]);
    delete timerRefs.current[id];
  }, []);

  const addToast = useCallback(
    (message, type = "error") => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type }]);
      timerRefs.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss, duration],
  );

  useEffect(() => errorBus.subscribe(({ message, type }) => addToast(message, type)), [addToast]);

  // Handle 401 logout events dispatched by axiosClient
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      window.location.href = "/login";
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "380px",
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};
