import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import '../css/StudentDashboard.css';

function StudentDashboard() {
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [groupDetails, setGroupDetails] = useState(null);
  const navigate = useNavigate();
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'student') {
      navigate('/');
    } else {
      setUser(storedUser);

      // 📅 Lógica del aviso de pago
      const today = new Date();
      const day = today.getDate();
      if (day >= 1 && day <= 15) {
        setShowPaymentReminder(true);
      }

      if (storedUser.groupId) {
        // Obtener información del grupo
        fetch(`${API_URL}/groups/${storedUser.groupId._id}`)
          .then(res => res.json())
          .then(group => setGroupDetails(group))
          .catch(err => console.error('Error cargando grupo:', err));

        // Obtener clases programadas para el grupo
        fetch(`${API_URL}/groups/upcoming-classes/${storedUser.groupId._id}`)
          .then(res => res.json())
          .then(data => setUpcomingClasses(data))
          .catch(err => console.error(err));


        // Obtener notificaciones para el grupo
        fetch(`${API_URL}/notifications/${storedUser.groupId._id}`)
          .then(res => res.json())
          .then(data => setNotifications(data))
          .catch(err => console.error(err));

      }
    }
  }, [navigate]);

  return (
    <div className="student-dashboard">

      {showPaymentReminder && (
        <div style={{
          background: '#ff9b00',
          color: '#000',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '1rem',
          fontWeight: '600'
        }}>
          📢 ¡Recuerda realizar el pago de la matrícula antes del 15 de este mes!
        </div>
      )}
      <h2 className="welcome-title">Bienvenido, {user.name}</h2>

      <div className="dashboard-grid">
        {/* Grupo Asignado */}
        <div className="dashboard-card">
          <h3>Grupo Asignado</h3>
          <p>{groupDetails ? groupDetails.name : 'Sin grupo asignado'}</p>
        </div>

        {/* Próximas Clases */}
        <div className="dashboard-card">
          <h3>Próximas Clases</h3>
          {upcomingClasses.length ? (
            <ul>
              {upcomingClasses.map((cls, index) => (
                <li key={index}>
                  📅 {new Date(cls.date).toLocaleDateString()} - 🕒 {cls.startTime || 'Hora no definida'}<br />
                  📍 {cls.place || 'Lugar no definido'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay clases programadas.</p>
          )}
        </div>

        {/* Últimas Notificaciones */}
        <div className="dashboard-card">
          <h3>Últimas Notificaciones</h3>

          {notifications.length ? (
            <>
              <div className={showAllNotifications ? "notifications-scroll" : undefined}>
                <ul>
                  {(showAllNotifications ? notifications : notifications.slice(-3)).map((note, index) => (
                    <li key={note._id ?? index}>🔔 {note.message}</li>
                  ))}
                </ul>
              </div>

              {notifications.length > 3 && (
                <button
                  type="button"
                  className="ver-mas-btn"
                  onClick={() => setShowAllNotifications(v => !v)}
                  aria-expanded={showAllNotifications}
                >
                  {showAllNotifications ? "Ocultar" : "Ver más"}
                </button>
              )}
            </>
          ) : (
            <p>No hay notificaciones recientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
