import { useEffect, useState } from "react";
import EventModal from "./EventModal"; // Importar el modal
import { useLocation } from 'react-router-dom';
import API_URL from '../config';

import "../css/EventsPage.css"; // Importar estilos CSS

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [highlightedEventId, setHighlightedEventId] = useState(null); // ID del evento destacado
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10); // Número de eventos por página
  const [expandedEventId, setExpandedEventId] = useState(null); // ID del evento expandido


  useEffect(() => {

    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const eventId = params.get('eventId');
    if (eventId) {
      setHighlightedEventId(eventId);
    }


  fetch(`${API_URL}/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSaveEvent = (eventData, shouldSend = false) => {


    const endpoint = currentEvent
      ? `${API_URL}/events/${currentEvent._id}`
      : `${API_URL}/events`;

    const method = currentEvent ? "PUT" : "POST";
 
    fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...eventData,
        subject: eventData.subject || "Sin Asunto", // Por si no rellenan el campo
      }),
    })
      .then((res) => res.json())
      .then((savedEvent) => {


        if (method === "POST") {
          setEvents((prev) => [...prev, savedEvent]);
        } else {
          setEvents((prev) =>
            prev.map((event) => (event._id === savedEvent._id ? savedEvent : event))
          );
        }

        if (shouldSend) {
          handleSendEmail(savedEvent); // Enviar correo
        }

        setModalOpen(false);
        setCurrentEvent(null);
      })
      .catch((err) => console.error(err));
  };


  const handleDeleteEvent = (eventId) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este evento?"
    );
    if (!confirmDelete) return;

    fetch(`${API_URL}/events/${eventId}`, {
      method: "DELETE",
    })
      .then(() => {
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
      })
      .catch((err) => console.error(err));
  };


  const handleSendEmail = (eventData) => {
    console.log('📤 Enviando correo para el evento:', eventData);

    fetch(`${API_URL}/events/${eventData._id}/send-email`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("📬 Respuesta del backend:", data);
        alert("Correo enviado correctamente.");
      })
      .catch((err) => console.error("❌ Error al enviar el correo:", err));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
  };

const indexOfLastEvent = currentPage * eventsPerPage;
const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
const filteredEvents = events
  .filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter(event => {
    if (!selectedMonth) return true;
    const eventMonth = new Date(event.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    return eventMonth === selectedMonth;
  });

const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

const handlePageChange = (page) => {
  if (page > 0 && page <= totalPages) setCurrentPage(page);
};

  return (
    <div className="events-page1">
      <h2>Gestión de Eventos</h2>
      <button onClick={() => setModalOpen(true)}>Crear Nuevo Evento</button>
      <div className="tricks-filters" >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '30%',
            padding: '8px 12px',
            borderRadius: '20px',
            border: '1px solid #555',
            background: 'transparent',
            color: 'white',
            marginRight: '10px',
            fontFamily: 'Quicksand, sans-serif'
          }}
        />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="filter-button selected"
          style={{

            border: '1px solid #555',
            background: 'transparent',

          }}

        >
          <option value="">Meses</option>
          {Array.from(new Set(events.map(event =>
            new Date(event.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })
          ))).map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <button className="filter-button" onClick={clearFilters}>Limpiar Filtros</button>
      </div>


<table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ backgroundColor: '#252539' }}>
      <th style={{ padding: '12px', color: '#ff9b00' }}>Nombre</th>
      <th className="hide-on-mobile" style={{ padding: '12px', color: '#ff9b00' }}>Fecha</th>
      <th className="hide-on-mobile" style={{ padding: '12px', color: '#ff9b00' }}>Publicado</th>
      <th className="hide-on-mobile" style={{ padding: '12px', color: '#ff9b00' }}>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {currentEvents.map(event => (
      <tr key={event._id} style={{ backgroundColor: '#1E1E2F', borderBottom: '1px solid #3A3A50' }}>
        <td 
          style={{ padding: '12px' }} 
          onClick={() => setExpandedEventId(expandedEventId === event._id ? null : event._id)}
        >
          {event.name} 
          <span className="toggle-arrow">{expandedEventId === event._id ? '▲' : '▼'}</span>
        </td>

        {(expandedEventId === event._id || window.innerWidth > 768) && (
          <>
            <td className="hide-on-mobile" style={{ padding: '12px' }}>
              {new Date(event.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </td>
            <td className="hide-on-mobile" style={{ padding: '12px' }}>
              {event.published ? "Sí" : "No"}
            </td>
            <td className="hide-on-mobile" style={{ padding: '12px' }}>
              <button onClick={() => { setCurrentEvent(event); setModalOpen(true); }}>Editar</button>
              <button onClick={() => handleDeleteEvent(event._id)}>Eliminar</button>
            </td>

            {/* Móvil - Info Expandida */}
            {window.innerWidth <= 768 && (
              <td colSpan="3" style={{ padding: '12px' }}>
                <div><strong>Fecha:</strong> {new Date(event.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
                <div><strong>Publicado:</strong> {event.published ? "Sí" : "No"}</div>
                <button onClick={() => { setCurrentEvent(event); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDeleteEvent(event._id)}>Eliminar</button>
              </td>
            )}
          </>
        )}
      </tr>
    ))}
  </tbody>
</table>

<div className="pagination">
  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
  <span>Página {currentPage} de {totalPages}</span>
  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
</div>

      {/* Modal para creación/edición */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentEvent(null);
        }}
        onSave={handleSaveEvent}
        event={currentEvent}
      />
    </div>
  );
}

export default EventsPage;
