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
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ColorMode>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeId | null;
    const storedMode = localStorage.getItem("mode") as ColorMode | null;
    if (storedTheme) applyTheme(storedTheme);
    if (storedMode) applyMode(storedMode);
  }, []);

  const setTheme = (t: ThemeId) => {
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  const toggleMode = () => {
    const next: ColorMode = mode === "dark" ? "light" : "dark";
    localStorage.setItem("mode", next);
    applyMode(next);
  };

  const applyTheme = (t: ThemeId) => {
    document.documentElement.setAttribute("data-theme", t);
    setThemeState(t);
  };

  const applyMode = (m: ColorMode) => {
    document.documentElement.setAttribute("data-mode", m);
    setModeState(m);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
