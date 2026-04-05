import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type CSSProperties, type Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  ref,
  style,
  ...props
}: ButtonProps) {
  const accentStyle: CSSProperties =
    variant === "primary"
      ? { backgroundColor: "var(--accent)", ...style }
      : (style ?? {});

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={accentStyle}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-[var(--accent-ring)]",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-11 px-6 text-base",
        variant === "primary" && "text-white hover:brightness-110 active:brightness-90",
        variant === "secondary" &&
          "bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-800",
        variant === "ghost" &&
          "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        variant === "destructive" &&
          "bg-red-600/20 text-red-400 ring-1 ring-red-500/30 hover:bg-red-600/30",
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
