import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import API_URL from "../config";

const ColorInput = ({ label, value, onChange }) => (
    <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
        <label>{label}</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ width: 36, height: 24, padding: 0, border: "1px solid #ddd", borderRadius: 4, flex: "0 0 auto" }}
            />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ flex: "1 1 0%", minWidth: 0, width: "100%", boxSizing: "border-box" }}
            />
        </div>
    </div>
);


// ⬇️ helper robusto: sube imagen y devuelve la URL
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
    return url; // ej. "/uploads/theme/1737012345678-foto.jpg"
}


export default function AdminThemeCustomizer() {
    const { theme, setTheme, saveTheme } = useTheme();
    const [draft, setDraft] = useState(theme);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const update = (k, v) => {
        setDraft(d => ({ ...d, [k]: v }));
        setTheme(t => ({ ...t, [k]: v })); // 👈 live preview en toda la app
    };

    const onSave = async () => {
        try {
            setSaving(true);
            await saveTheme(draft);
            setMsg("Tema guardado ✔");
            setTimeout(() => setMsg(""), 2000);
        } catch (e) {
            setMsg("Error guardando el tema");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="kcard" style={{ padding: 16, display: "grid", gap: 16, minWidth: 0 }}>
            <h2 style={{ fontFamily: "var(--kk-font-heading)" }}>Customizer de Tema</h2>

            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Colores</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "start", minWidth: 0 }}>
                    <ColorInput label="Primario" value={draft.colorPrimary} onChange={v => update("colorPrimary", v)} />
                    <ColorInput label="Secundario" value={draft.colorSecondary} onChange={v => update("colorSecondary", v)} />
                    <ColorInput label="Acento" value={draft.colorAccent} onChange={v => update("colorAccent", v)} />
                    <ColorInput label="Fondo" value={draft.colorBg} onChange={v => update("colorBg", v)} />
                    <ColorInput label="Surface" value={draft.colorSurface} onChange={v => update("colorSurface", v)} />
                    <ColorInput label="Texto" value={draft.colorText} onChange={v => update("colorText", v)} />
                </div>
            </section>

            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Imágenes de login</h3>
                <small>
                    Recomendadas: <b>Desktop</b> 1920×1080 (16:9) • <b>Móvil</b> 1080×1920 (9:16).
                    Usa JPG/WebP y &lt; 500KB para que cargue rápido.
                </small>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                    {/* Desktop */}
                    <div style={{ display: "grid", gap: 6 }}>
                        <label>Desktop (URL)</label>
                        <input
                            type="text"
                            value={draft.loginBgDesktop || ""}
                            onChange={(e) => update("loginBgDesktop", e.target.value)}
                            placeholder="https://..."
                        />
                        <label>o subir archivo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const url = await uploadImage(file, "desktop"); // <-- string literal, NO 'target'
                                    update("loginBgDesktop", url);
                                    setMsg("Imagen desktop subida ✔");
                                    setTimeout(() => setMsg(""), 2000);
                                } catch (err) {
                                    console.error(err);
                                    setMsg(`Error subiendo imagen desktop: ${err.message || ""}`);
                                    setTimeout(() => setMsg(""), 3000);
                                }
                            }}
                        />
                    </div>

                    {/* Mobile */}
                    <div style={{ display: "grid", gap: 6 }}>
                        <label>Móvil (URL)</label>
                        <input
                            type="text"
                            value={draft.loginBgMobile || ""}
                            onChange={(e) => update("loginBgMobile", e.target.value)}
                            placeholder="https://... (vacío = usa la de desktop)"
                        />
                        <label>o subir archivo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const url = await uploadImage(file, "mobile"); // <-- string literal, NO 'target'
                                    update("loginBgMobile", url);
                                    setMsg("Imagen móvil subida ✔");
                                    setTimeout(() => setMsg(""), 2000);
                                } catch (err) {
                                    console.error(err);
                                    setMsg(`Error subiendo imagen móvil: ${err.message || ""}`);
                                    setTimeout(() => setMsg(""), 3000);
                                }
                            }}
                        />
                    </div>

                </div>
            </section>




            <div style={{ display: "flex", gap: 8 }}>
                <button className="kbtn" onClick={onSave} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar tema"}
                </button>
                {msg && <span>{msg}</span>}
            </div>
        </div>
    );
}
