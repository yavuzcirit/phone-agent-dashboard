"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import type { ToastItem } from "@/hooks/useToast";

interface ToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl pointer-events-auto min-w-[280px] max-w-sm " +
            (t.variant === "success"
              ? "bg-emerald-950 border-emerald-700/50 text-emerald-300"
              : "bg-red-950 border-red-700/50 text-red-300")
          }
        >
          {t.variant === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          )}
          <span className="flex-1 text-sm">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
