import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const DEFAULT_THEME = {
  colorPrimary: "#0ea5e9",
  colorSecondary: "#f59e0b",
  colorAccent: "#22c55e",
  colorBg: "#ffffff",
  colorSurface: "#f7f7f8",
  colorText: "#111827",
  radius: 12,
  shadow: "light", // light|medium|strong
  fontSans: "Inter",
  fontHeading: "Poppins"
};

const SHADOW_MAP = {
  light: "0 8px 24px rgba(0,0,0,0.08)",
  medium: "0 10px 30px rgba(0,0,0,0.12)",
  strong: "0 14px 40px rgba(0,0,0,0.18)"
};

function applyThemeVars(t) {
  const r = document.documentElement.style;
  r.setProperty("--kk-color-primary", t.colorPrimary);
  r.setProperty("--kk-color-secondary", t.colorSecondary);
  r.setProperty("--kk-color-accent", t.colorAccent);
  r.setProperty("--kk-color-bg", t.colorBg);
  r.setProperty("--kk-color-surface", t.colorSurface);
  r.setProperty("--kk-color-text", t.colorText);
  r.setProperty("--kk-radius", `${t.radius}px`);
  r.setProperty("--kk-shadow", SHADOW_MAP[t.shadow] || SHADOW_MAP.light);
  r.setProperty("--kk-font-sans", t.fontSans);
  r.setProperty("--kk-font-heading", t.fontHeading);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/theme`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const next = { ...DEFAULT_THEME, ...data };
          setTheme(next);
          applyThemeVars(next);
        } else {
          applyThemeVars(DEFAULT_THEME);
        }
      } catch {
        applyThemeVars(DEFAULT_THEME);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { if (!loading) applyThemeVars(theme); }, [theme, loading]);

  const saveTheme = async (draft) => {
    const next = { ...theme, ...draft };
    setTheme(next); // live preview
    const res = await fetch(`${API_URL}/admin/theme`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(next)
    });
    if (!res.ok) throw new Error("No se pudo guardar el tema");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}
