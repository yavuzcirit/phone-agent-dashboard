"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const handleClick = () => {
    if (!disabled) onChange(!checked);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={handleClick}
    >
      <button
        role="switch"
        aria-checked={checked}
        type="button"
        disabled={disabled}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        style={checked ? { backgroundColor: "var(--accent)" } : undefined}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[var(--accent-ring)]",
          checked ? "" : "bg-slate-700"
        )}
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>

      <div className="flex flex-col gap-0.5 select-none">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {description && <span className="text-xs text-slate-500">{description}</span>}
      </div>
    </div>
  );
}
