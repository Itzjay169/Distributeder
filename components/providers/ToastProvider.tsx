"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string, title?: string) => addToast(msg, "success", title), [addToast]);
  const error = useCallback((msg: string, title?: string) => addToast(msg, "error", title), [addToast]);
  const info = useCallback((msg: string, title?: string) => addToast(msg, "info", title), [addToast]);
  const warning = useCallback((msg: string, title?: string) => addToast(msg, "warning", title), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const bgColors = {
            success: "bg-emerald-900/90 border-emerald-500/50 text-emerald-100",
            error: "bg-red-900/90 border-red-500/50 text-red-100",
            warning: "bg-amber-900/90 border-amber-500/50 text-amber-100",
            info: "bg-slate-900/90 border-blue-500/50 text-slate-100",
          }[t.type];

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgColors}`}
            >
              {icons}
              <div className="flex-1 text-sm">
                {t.title && <div className="font-semibold text-white mb-0.5">{t.title}</div>}
                <div className="text-xs sm:text-sm opacity-90">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-white/60 hover:text-white transition p-0.5"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
