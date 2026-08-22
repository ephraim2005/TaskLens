import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const THEMES = {
  light: {
    bg: "#FAF9F6",
    ink: "#1B1F1D",
    sub: "#6B7570",
    faint: "#A9A499",
    panelBg: "#FFFFFF",
    border: "#E4E1D8",
    borderHover: "#C9C3B2",
    dashedBg: "#FFFFFF",
    dashedBgActive: "#FBF3E4",
    amber: "#E1A339",
    amberBg: "#FBF3E4",
    teal: "#2C6E76",
    tealBg: "#EAF3F3",
    error: "#A14E1F",
    invert: "#FAF9F6",
    overlay: "rgba(27,31,29,0.75)",
  },
  dark: {
    bg: "#15181A",
    ink: "#F2F1EC",
    sub: "#9AA39D",
    faint: "#5F6864",
    panelBg: "#1E2224",
    border: "#333A38",
    borderHover: "#4A524E",
    dashedBg: "#1E2224",
    dashedBgActive: "#2B2617",
    amber: "#E9B355",
    amberBg: "#2B2617",
    teal: "#5FA9B0",
    tealBg: "#1D2E2F",
    error: "#E08B5B",
    invert: "#15181A",
    overlay: "rgba(0,0,0,0.75)",
  },
};

const STORAGE_KEY = "tasklens.theme";

const ThemeContext = createContext(null);

function getInitialMode() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialMode);
  const theme = dark ? THEMES.dark : THEMES.light;

  // Apply the background to the actual document so it covers the full
  // viewport (including areas outside the app's own wrapper div), and
  // persist the choice so it holds across every page and reload.
  useEffect(() => {
    document.documentElement.style.background = theme.bg;
    document.body.style.background = theme.bg;
    document.body.style.color = theme.ink;
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
    window.localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }, [dark, theme.bg, theme.ink]);

  const value = useMemo(() => ({ dark, setDark, toggleDark: () => setDark((d) => !d), theme }), [dark, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
