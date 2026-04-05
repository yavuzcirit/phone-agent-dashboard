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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with server-safe defaults — the inline <script> in layout.tsx has
  // already applied the correct data-* attributes to <html> before React
  // hydrates, so there is no visual flash. We then sync React state in
  // useEffect (client-only) so the toggle reflects the real saved value.
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ColorMode>("dark");

  useEffect(() => {
    const storedTheme = (localStorage.getItem("theme") as ThemeId) || DEFAULT_THEME;
    const storedMode  = (localStorage.getItem("mode")  as ColorMode) || "dark";
    setThemeState(storedTheme);
    setModeState(storedMode);
    // Ensure attributes are set in case script ran before CSS was ready
    document.documentElement.setAttribute("data-theme", storedTheme);
    document.documentElement.setAttribute("data-mode",  storedMode);
  }, []);

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
