export type ThemeId = "indigo" | "sky" | "violet" | "emerald";

export interface Theme {
  id: ThemeId;
  label: string;
  color: string;
}

export const THEMES: Theme[] = [
  { id: "indigo", label: "Indigo", color: "#818cf8" },
  { id: "sky",    label: "Sky",    color: "#38bdf8" },
  { id: "violet", label: "Violet", color: "#a78bfa" },
  { id: "emerald",label: "Emerald",color: "#34d399" },
];

export const DEFAULT_THEME: ThemeId = "indigo";
