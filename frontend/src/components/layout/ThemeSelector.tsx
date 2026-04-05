"use client";

import { THEMES } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-4 pb-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600 mb-2">
        Theme
      </p>
      <div className="flex gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTheme(t.id)}
            className={cn(
              "h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-slate-900 transition-transform hover:scale-110",
              theme === t.id ? "ring-white/60 scale-110" : "ring-transparent"
            )}
            style={{ background: t.color }}
          />
        ))}
      </div>
    </div>
  );
}
