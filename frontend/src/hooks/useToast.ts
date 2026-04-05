"use client";

import { useCallback, useRef, useState } from "react";

export type ToastVariant = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const notify = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, notify, dismiss };
}
