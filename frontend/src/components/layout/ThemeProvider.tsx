"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, type ThemeId } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeId | null;
    if (stored) applyTheme(stored);
  }, []);

  const setTheme = (t: ThemeId) => {
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  const applyTheme = (t: ThemeId) => {
    document.documentElement.setAttribute("data-theme", t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
