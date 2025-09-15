import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const DEFAULT_THEME = {
    colorPrimary: "#FF4081",
    colorSecondary: "#007997",
    colorAccent: "#f59e0b",
    colorBg: "#1e1e2f",
    colorSurface: "#252539",
    colorText: "#111827",
    radius: 12,
    shadow: "light", // light|medium|strong
    fontSans: "Inter",
    fontHeading: "Poppins"
};



function applyThemeVars(t) {
  const r = document.documentElement.style;

  // === variables que usa TU CSS ===
  r.setProperty('--kk-color-primary',  t.colorPrimary);
  r.setProperty('--kk-color-secondary',t.colorSecondary);
  r.setProperty('--kk-color-accent',   t.colorAccent   || 'var(--kk-color-accent)');
  r.setProperty('--kk-color-text',     t.colorText     || '#111827');
  r.setProperty('--kk-color-bg',       t.colorBg       || '#1e1e2f');
  r.setProperty('--kk-color-surface',  t.colorSurface  || '#252539');
  r.setProperty('--kk-gradient',       `linear-gradient(to right, ${t.colorPrimary}, ${t.colorSecondary})`);

  // === back-compat por si en algún lado usamos la otra convención ===
  r.setProperty('--kk-primary',   t.colorPrimary);
  r.setProperty('--kk-secondary', t.colorSecondary);
  r.setProperty('--kk-accent',    t.colorAccent   || 'var(--kk-color-accent)');
  r.setProperty('--kk-text',      t.colorText     || '#111827');
  r.setProperty('--kk-bg',        t.colorBg       || '#1e1e2f');
  r.setProperty('--kk-surface',   t.colorSurface  || '#252539');
  r.setProperty('--kk-grad',      `linear-gradient(90deg, ${t.colorPrimary}, ${t.colorSecondary})`);
}


export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/admin/theme`);
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
