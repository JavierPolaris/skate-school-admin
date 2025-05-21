import { useState } from "react";

function EventModal({ isOpen, onClose, onSave, event }) {
  const [eventData, setEventData] = useState(
    event || {
      name: "",
      subject: "",
      date: new Date().toISOString(),
      layout: "header-body-image",
      imageUrl: "",
      bodyText: "",
      published: false, // Nuevo campo para publicación
      targetAll: true,
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData({
      ...eventData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

const handleSave = (shouldSend = false) => {

  onSave(eventData, shouldSend);
};




  if (!isOpen) return null;

 return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
      }}
    >
      <div className='modal'>
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
          value={eventData.subject || ""}
          onChange={handleChange}
          
        />

        {/* Removed Date Input */}

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
        <label  style={{ display: "flex" }}>
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
