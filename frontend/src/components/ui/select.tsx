import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Ref, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, ref, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-9 text-sm text-slate-200 transition-colors focus-ring-accent disabled:opacity-50 appearance-none cursor-pointer",
          className
        )}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
    </div>
  );
}
