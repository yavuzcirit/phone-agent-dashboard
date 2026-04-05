import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type Ref } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus-ring-accent disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
