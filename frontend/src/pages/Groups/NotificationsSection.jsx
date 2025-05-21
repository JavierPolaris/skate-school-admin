import  { useState } from 'react';

function NotificationsSection({ groupId, notifications, onNotificationAdded }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    fetch(`http://localhost:5000/api/groups/${groupId}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(updatedGroup => {
      onNotificationAdded(updatedGroup.notifications);
      setMessage('');
    })
    .catch(err => console.error(err));
  };

  return (
    <div style={{ marginTop: '1rem', marginBlockEnd: '5rem' }}>
      <h4>Notificaciones</h4>
      <textarea 
        rows={3} 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        placeholder="Escribe una notificación..."
        style={{ width: '-webkit-fill-available'}}
      />
      <br/>
      <button onClick={handleSend}>Enviar Notificación</button>
      <h5>Notificaciones Enviadas:</h5>
      <ul>
        {notifications && notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <li key={index}>
              <strong>{new Date(notif.date).toLocaleString()}:</strong> {notif.message}
            </li>
          ))
        ) : (
          <p>No hay notificaciones todavía</p>
        )}
      </ul>
    </div>
  );
}

export default NotificationsSection;
