import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const ColorInput = ({ label, value, onChange }) => (
    <div style={{ display: "grid", gap: 6 }}>
        <label>{label}</label>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

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
        <div className="kcard" style={{ padding: 16, display: "grid", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--kk-font-heading)" }}>Customizer de Tema</h2>

            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Colores</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
                    <ColorInput label="Primario" value={draft.colorPrimary} onChange={v => update("colorPrimary", v)} />
                    <ColorInput label="Secundario" value={draft.colorSecondary} onChange={v => update("colorSecondary", v)} />
                    <ColorInput label="Acento" value={draft.colorAccent} onChange={v => update("colorAccent", v)} />
                    <ColorInput label="Fondo" value={draft.colorBg} onChange={v => update("colorBg", v)} />
                    <ColorInput label="Surface" value={draft.colorSurface} onChange={v => update("colorSurface", v)} />
                    <ColorInput label="Texto" value={draft.colorText} onChange={v => update("colorText", v)} />
                </div>
            </section>

            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Tipografías</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                    <div>
                        <label>Sans</label>
                        <select value={draft.fontSans} onChange={e => update("fontSans", e.target.value)}>
                            <option>Inter</option><option>Rubik</option><option>Montserrat</option><option>System UI</option>
                        </select>
                    </div>
                    <div>
                        <label>Heading</label>
                        <select value={draft.fontHeading} onChange={e => update("fontHeading", e.target.value)}>
                            <option>Poppins</option><option>Oswald</option><option>Raleway</option><option>Inter</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Esquinas y sombras</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                    <div>
                        <label>Radio (px)</label>
                        <input type="range" min="0" max="24" value={draft.radius}
                            onChange={e => update("radius", Number(e.target.value))} />
                        <div>{draft.radius}px</div>
                    </div>
                    <div>
                        <label>Sombra</label>
                        <select value={draft.shadow} onChange={e => update("shadow", e.target.value)}>
                            <option value="light">Ligera</option>
                            <option value="medium">Media</option>
                            <option value="strong">Fuerte</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Vista previa mínima */}
            <section className="kcard" style={{ padding: 16, display: "grid", gap: 12 }}>
                <h3>Vista previa</h3>
                <div className="kcard" style={{ padding: 16 }}>
                    <h4 style={{ fontFamily: "var(--kk-font-heading)" }}>Título de ejemplo</h4>
                    <p>Texto de ejemplo con <a className="klink" href="#">enlace</a>.</p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="kbtn">Primario</button>
                        <button className="kbtn kbtn--secondary">Secundario</button>
                        <span className="kbadge">Badge</span>
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
