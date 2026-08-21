import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import Icon from "../components/Icon";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { t } = useLanguage();

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold shadow-soft ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-forest/10 bg-white text-forest"
            }`}
            key={toast.id}
            role="status"
          >
            <Icon name={toast.type === "error" ? "X" : "CheckCircle2"} className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{t(toast.message)}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
