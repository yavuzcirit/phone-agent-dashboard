"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, type ThemeId } from "@/lib/themes";

export type ColorMode = "dark" | "light";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  mode: ColorMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  mode: "dark",
  toggleMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Read the value already applied by the inline <script> in layout.tsx
// so React state stays in sync with what's already on <html> — no flash.
function getInitialMode(): ColorMode {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("mode") as ColorMode) || "dark";
}

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return (localStorage.getItem("theme") as ThemeId) || DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme);
  const [mode, setModeState] = useState<ColorMode>(getInitialMode);

  // Keep data-* attributes in sync when the provider mounts
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.setAttribute("data-theme", theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (t: ThemeId) => {
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
    setThemeState(t);
  };

  const toggleMode = () => {
    const next: ColorMode = mode === "dark" ? "light" : "dark";
    localStorage.setItem("mode", next);
    document.documentElement.setAttribute("data-mode", next);
    setModeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
