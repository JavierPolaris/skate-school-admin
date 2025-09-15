import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const DEFAULT_THEME = {
  colorPrimary: "#FF4081",
  colorSecondary: "#007997",
  colorAccent: "#f59e0b",
  colorBg: "#1e1e2f",
  colorSurface: "#252539",
  colorText: "#ffffffff",
  radius: 12,
  shadow: "light", // light|medium|strong
  fontSans: "Inter",
  fontHeading: "Poppins",
  // 👇 fondos de login
  loginBgDesktop:
    "https://www.kedekids.com/wp-content/uploads/2020/09/CAR_2767-scaled.jpg",
  loginBgMobile: "", // vacío => usa el de desktop
};

function applyThemeVars(t) {
  const r = document.documentElement.style;

  // === variables que usa TU CSS ===
  r.setProperty("--kk-color-primary", t.colorPrimary);
  r.setProperty("--kk-color-secondary", t.colorSecondary);
  r.setProperty("--kk-color-accent", t.colorAccent || "#f59e0b");
  r.setProperty("--kk-color-text", t.colorText || "#ffffffff");
  r.setProperty("--kk-color-bg", t.colorBg || "#1e1e2f");
  r.setProperty("--kk-color-surface", t.colorSurface || "#252539");
  r.setProperty(
    "--kk-gradient",
    `linear-gradient(to right, ${t.colorPrimary}, ${t.colorSecondary})`
  );

  // === back-compat (si en algún lado usas esta convención) ===
  r.setProperty("--kk-primary", t.colorPrimary);
  r.setProperty("--kk-secondary", t.colorSecondary);
  r.setProperty("--kk-accent", t.colorAccent || "#f59e0b");
  r.setProperty("--kk-text", t.colorText || "#ffffffff");
  r.setProperty("--kk-bg", t.colorBg || "#1e1e2f");
  r.setProperty("--kk-surface", t.colorSurface || "#252539");
  r.setProperty(
    "--kk-grad",
    `linear-gradient(90deg, ${t.colorPrimary}, ${t.colorSecondary})`
  );

  // === imágenes de login (siempre con url("...")) ===
  const desk = t.loginBgDesktop || DEFAULT_THEME.loginBgDesktop;
  const mob = t.loginBgMobile || desk;
  r.setProperty("--kk-login-bg-desktop", `url("${desk}")`);
  r.setProperty("--kk-login-bg-mobile", `url("${mob}")`);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  // Boot: aplica defaults y luego sincroniza con API
  useEffect(() => {
    applyThemeVars(DEFAULT_THEME);
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/theme`);
        if (res.ok) {
          const data = await res.json();
          const next = { ...DEFAULT_THEME, ...data };
          setTheme(next);
          applyThemeVars(next);
        }
      } catch {
        // nos quedamos con defaults si falla
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) applyThemeVars(theme);
  }, [theme, loading]);

  const saveTheme = async (draft) => {
    const next = { ...theme, ...draft };
    setTheme(next);            // live preview
    applyThemeVars(next);      // aplica en caliente

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/admin/theme`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(next),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("PUT /admin/theme falló", res.status, txt);
      throw new Error("No se pudo guardar el tema");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}
