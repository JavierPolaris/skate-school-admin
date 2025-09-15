import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import API_URL from "../config";

/* ---------------- Color input ---------------- */
const ColorInput = ({ label, value, onChange }) => (
  <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
    <label>{label}</label>
    <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 36,
          height: 24,
          padding: 0,
          border: "1px solid #ddd",
          borderRadius: 4,
          flex: "0 0 auto",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: "1 1 0%", minWidth: 0, width: "100%", boxSizing: "border-box" }}
      />
    </div>
  </div>
);

/* ------------- helpers imágenes -------------- */
// base absoluto para convertir /uploads/... → https://render-host/uploads/...
const ASSETS_BASE = (API_URL || "").replace(/\/api\/?$/, "");
const toAbs = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${ASSETS_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

// sube imagen y devuelve URL (normalmente /uploads/theme/xxx.jpg)
async function uploadImage(file, type) {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API_URL}/admin/theme/upload-login-bg?type=${type}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const { url } = await res.json();
  return url;
}

export default function AdminThemeCustomizer() {
  const { theme, setTheme, saveTheme } = useTheme();
  const [draft, setDraft] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Modal biblioteca
  const [showPicker, setShowPicker] = useState(false);
  const [pickerFor, setPickerFor] = useState("desktop"); // 'desktop' | 'mobile'
  const [library, setLibrary] = useState([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [libErr, setLibErr] = useState("");

  const update = (k, v) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setTheme((t) => ({ ...t, [k]: v })); // live preview
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await saveTheme(draft);
      setMsg("Tema guardado ✔");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Error guardando el tema");
    } finally {
      setSaving(false);
    }
  };

  const openPicker = async (which) => {
    setPickerFor(which);
    setShowPicker(true);
    setLoadingLib(true);
    setLibErr("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/theme/login-bg-library`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLibrary(Array.isArray(data) ? data : []);
    } catch (e) {
      setLibErr(e?.message || "Error cargando biblioteca");
    } finally {
      setLoadingLib(false);
    }
  };

  const pickImage = (url) => {
    if (pickerFor === "mobile") update("loginBgMobile", url);
    else update("loginBgDesktop", url);
    setShowPicker(false);
  };

  /* ---- Componente campo de imagen con preview + subir + URL ---- */
  const ImageField = ({ label, value, onChange, type }) => (
    <div style={{ display: "grid", gap: 8 }}>
      <label>{label}</label>

      {/* mini-preview clicable */}
      <div
        onClick={() => openPicker(type)}
        title="Abrir biblioteca"
        style={{
          height: 96,
          borderRadius: 8,
          border: "1px solid #333",
          overflow: "hidden",
          cursor: "pointer",
          background: "#1f2230",
          display: "grid",
          placeItems: "center",
        }}
      >
        {value ? (
          <img
            src={toAbs(value)}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span style={{ opacity: 0.7, fontSize: 12 }}>Sin imagen (clic para elegir)</span>
        )}
      </div>

      {/* URL manual */}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... o /uploads/theme/archivo.jpg"
        style={{ width: "100%", boxSizing: "border-box" }}
      />

      {/* subida archivo */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const url = await uploadImage(file, type);
              onChange(url);
              setMsg(`Imagen ${type} subida ✔`);
              setTimeout(() => setMsg(""), 2000);
            } catch (err) {
              console.error(err);
              setMsg(`Error subiendo imagen ${type}: ${err.message || ""}`);
              setTimeout(() => setMsg(""), 3000);
            }
          }}
        />
        <small style={{ opacity: 0.7 }}>
          Recomendadas: <b>Desktop</b> 1920×1080 • <b>Móvil</b> 1080×1920 • &lt; 500KB
        </small>
      </div>
    </div>
  );

  return (
    <div className="kcard" style={{ padding: 16, display: "grid", gap: 16, minWidth: 0 }}>
      <h2 style={{ fontFamily: "var(--kk-font-heading)" }}>Customizer de Tema</h2>

      {/* Colores */}
      <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
        <h3>Colores</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "start",
            minWidth: 0,
          }}
        >
          <ColorInput label="Primario" value={draft.colorPrimary} onChange={(v) => update("colorPrimary", v)} />
          <ColorInput label="Secundario" value={draft.colorSecondary} onChange={(v) => update("colorSecondary", v)} />
          <ColorInput label="Acento" value={draft.colorAccent} onChange={(v) => update("colorAccent", v)} />
          <ColorInput label="Fondo" value={draft.colorBg} onChange={(v) => update("colorBg", v)} />
          <ColorInput label="Surface" value={draft.colorSurface} onChange={(v) => update("colorSurface", v)} />
          <ColorInput label="Texto" value={draft.colorText} onChange={(v) => update("colorText", v)} />
        </div>
      </section>

      {/* Imágenes de login */}
      <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
        <h3>Imágenes de login</h3>
        <small>
          Recomendadas: <b>Desktop</b> 1920×1080 (16:9) • <b>Móvil</b> 1080×1920 (9:16). Usa JPG/WebP y &lt; 500KB para que
          cargue rápido.
        </small>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <ImageField label="Desktop" type="desktop" value={draft.loginBgDesktop} onChange={(v) => update("loginBgDesktop", v)} />
          <ImageField label="Móvil" type="mobile" value={draft.loginBgMobile} onChange={(v) => update("loginBgMobile", v)} />
        </div>
      </section>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="kbtn" onClick={onSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar tema"}
        </button>
        {msg && <span>{msg}</span>}
      </div>

      {/* Modal biblioteca tipo Shopify */}
      {showPicker && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="kcard"
            style={{
              width: "min(900px, 92vw)",
              height: "min(80vh, 680px)",
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
              gap: 12,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Biblioteca de imágenes</h3>
              <button className="kbtn kbtn--secondary" onClick={() => setShowPicker(false)}>
                Cerrar
              </button>
            </div>

            <div style={{ overflow: "auto" }}>
              {loadingLib ? (
                <p>Cargando…</p>
              ) : libErr ? (
                <p style={{ color: "tomato" }}>{libErr}</p>
              ) : library.length === 0 ? (
                <p>No hay imágenes todavía.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {library.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => pickImage(img.url)}
                      style={{
                        padding: 0,
                        border: "1px solid #333",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                      />
                      <div
                        style={{
                          fontSize: 12,
                          padding: "6px 8px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {img.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Consejo: usa JPG/WebP optimizado. Desktop 1920×1080 (16:9), Móvil 1080×1920 (9:16).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
