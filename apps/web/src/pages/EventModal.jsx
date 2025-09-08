import { useEffect, useState } from "react";

const EMPTY = {
  name: "",
  subject: "",
  date: new Date().toISOString(),
  layout: "header-body-image",
  imageUrl: "",
  bodyText: "",
  published: false,
  targetAll: true,
  targetGroups: [],
};

function EventModal({ isOpen, onClose, onSave, event }) {
  const [eventData, setEventData] = useState(EMPTY);

  // Resetea y sincroniza el formulario cuando se abre/cambia el evento
  useEffect(() => {
    if (isOpen) setEventData(event ? { ...EMPTY, ...event } : { ...EMPTY });
  }, [isOpen, event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (shouldSend = false) => {
    onSave(eventData, shouldSend);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
      }}
    >
      <div className="modal">
        <h3>{event ? "Editar Evento" : "Crear Evento"}</h3>

        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={eventData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="subject"
          placeholder="Asunto del email"
          value={eventData.subject}
          onChange={handleChange}
        />

        {/* Si quieres reactivar fecha visible, descomenta este bloque:
        <input
          type="datetime-local"
          name="date"
          value={new Date(eventData.date).toISOString().slice(0, 16)}
          onChange={(e) =>
            setEventData((p) => ({
              ...p,
              date: new Date(e.target.value).toISOString(),
            }))
          }
        />
        */}

        <select
          name="layout"
          value={eventData.layout}
          onChange={handleChange}
        >
          <option value="header-body-image">Header + Cuerpo + Imagen</option>
          <option value="image-header-body">Imagen + Header + Cuerpo</option>
          <option value="only-image">Solo Imagen</option>
        </select>

        <input
          type="text"
          name="imageUrl"
          placeholder="URL de la imagen"
          value={eventData.imageUrl}
          onChange={handleChange}
        />

        <textarea
          name="bodyText"
          placeholder="Texto del cuerpo"
          value={eventData.bodyText}
          onChange={handleChange}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="published"
            checked={eventData.published}
            onChange={handleChange}
          />
          Publicar Evento
        </label>

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button
            onClick={() => handleSave(true)}
            style={{ marginRight: "1rem" }}
            disabled={!eventData.subject?.trim()}
          >
            Enviar
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
