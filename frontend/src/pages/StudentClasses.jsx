import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/StudentDashboard.css';
import API_URL from '../config';

function StudentClasses() {
  const [user, setUser] = useState({});
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);

      if (storedUser.groupId) {
        fetch(`${API_URL}/api/groups/${storedUser.groupId._id}`)
          .then(res => res.json())
          .then(group => setGroupDetails(group));

        fetch(`${API_URL}/api/groups/upcoming-classes/${storedUser.groupId._id}`)
          .then(res => res.json())
          .then(data => setUpcomingClasses(data));
      }
    }
  }, []);

  const handleDayClick = (value) => {
    setSelectedDate(value);
    setShowModal(true);
  };

  const classesForSelectedDate = upcomingClasses.filter(
    c => new Date(c.date).toDateString() === selectedDate?.toDateString()
  );

  return (
    <div className="student-dashboard" style={{ padding: '2rem', color: '#fff' }}>
      <h2 className="welcome-title" style={{ color: '#ff9b00' }}>Tus Próximas Clases</h2>

      {upcomingClasses.length ? (
        <div className="dashboard-card" style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>📅 {new Date(upcomingClasses[0].date).toLocaleDateString()}</h3>
          <p>🕒 {upcomingClasses[0].startTime || 'Hora no definida'} - {upcomingClasses[0].endTime || 'Hora no definida'}</p>
          <p>📍 {upcomingClasses[0].place}</p>
        </div>
      ) : (
        <p style={{ marginTop: '1rem' }}>No hay clases próximas programadas.</p>
      )}

      <div className="dashboard-card calendarRes" style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h3 style={{ color: '#ff9b00' }}>Calendario de Clases</h3>
        <Calendar
          className="student-calendar"
          onClickDay={handleDayClick}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const foundClass = upcomingClasses.find(
                (c) => new Date(c.date).toDateString() === date.toDateString()
              );
              return foundClass ? <div className="class-dot"></div> : null;
            }
          }}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#ff9b00' }}>
              Clases para el {selectedDate?.toLocaleDateString()}
            </h3>
            {classesForSelectedDate.length ? (
              classesForSelectedDate.map((cls, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <p>🕒 {cls.startTime || 'Hora no definida'} - {cls.endTime || 'Hora no definida'}</p>
                  <p>📍 {cls.place}</p>
                </div>
              ))
            ) : (
              <p>No hay clases programadas para este día.</p>
            )}
            <button onClick={() => setShowModal(false)} className="close-modal-button">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentClasses;
