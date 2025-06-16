// src/pages/Groups/CalendarPlaceholder.jsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarPlaceholder({ group, onDatesChanged }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [focusedDate, setFocusedDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [place, setPlace] = useState('Skate park Bola de Oro');

  useEffect(() => {
    if (group && group.scheduledDates) {
      const converted = group.scheduledDates.map(d => ({
        date: new Date(d.date),
        startTime: d.startTime,
        endTime: d.endTime,
        place: d.place || 'Skate park Bola de Oro'
      }));
      setSelectedDates(converted);
      setFocusedDate(null);
      setStartTime('');
      setEndTime('');
      setPlace('Skate park Bola de Oro');
    } else {
      setSelectedDates([]);
      setFocusedDate(null);
      setStartTime('');
      setEndTime('');
      setPlace('Skate park Bola de Oro');
    }
  }, [group]);

  const handleChange = (date) => {
    const dateString = date.toDateString();
    const existing = selectedDates.find(d => d.date.toDateString() === dateString);

    if (existing) {
      setFocusedDate(existing.date);
      setStartTime(existing.startTime);
      setEndTime(existing.endTime);
      setPlace(existing.place || 'Skate park Bola de Oro');
    } else {
      const newDateObj = { date, startTime: '', endTime: '', place: 'Skate park Bola de Oro' };
      const updated = [...selectedDates, newDateObj];
      setSelectedDates(updated);
      setFocusedDate(date);
      setStartTime('');
      setEndTime('');
      setPlace('Skate park Bola de Oro');
    }
  };

  const handleApplyTimes = () => {
  if (!focusedDate) return;

  const dateString = focusedDate.toDateString();
  const updated = selectedDates.map(d => {
    if (d.date.toDateString() === dateString) {
      return { ...d, startTime, endTime, place }; // Aquí guardas el nuevo lugar correctamente
    }
    return d;
  });

  setSelectedDates(updated);
  onDatesChanged(updated); // Importante: Enviamos las fechas actualizadas al backend

   // ✅ Cierra la edición:
  setFocusedDate(null);
  setStartTime('');
  setEndTime('');
  setPlace('Skate park Bola de Oro');
};


  const handleDeleteDate = () => {
    if (!focusedDate) return;
    const dateString = focusedDate.toDateString();
    const updated = selectedDates.filter(d => d.date.toDateString() !== dateString);
    setSelectedDates(updated);
    setFocusedDate(null);
    setStartTime('');
    setEndTime('');
    setPlace('Skate park Bola de Oro');
    onDatesChanged(updated);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toDateString();
      if (selectedDates.find(d => d.date.toDateString() === dateString)) {
        return 'selected-date';
      }
    }
    return null;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>Calendario de Clases</h4>
      <Calendar
        onClickDay={handleChange}
        value={focusedDate || null}
        tileClassName={tileClassName}
      />
      <div style={{ marginTop: '1rem' }}>
        <h5>Asignar horas a la fecha seleccionada</h5>
        {!focusedDate && <p>No hay ninguna fecha enfocada para editar horas</p>}
        {focusedDate && (
          <div>
            <p>Fecha seleccionada: {focusedDate.toDateString()}</p>
            <label>
              Hora de inicio:
              <input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
              />
            </label>
            <br />
            <label>
              Hora de fin:
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
              />
            </label>
            <br />
            <label>
              Lugar:
              <input 
                type="text" 
                value={place} 
                onChange={e => setPlace(e.target.value)} 
                placeholder="Lugar de la clase"
              />
            </label>
            <br />
            <button onClick={handleApplyTimes}>Aplicar</button>
            <button onClick={handleDeleteDate} style={{ marginLeft: '0.5rem' }}>Eliminar fecha</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPlaceholder;
