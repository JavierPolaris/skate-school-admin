import  { useState } from 'react';
import API_URL from '../../config';

function NotificationsSection({ groupId, notifications, onNotificationAdded }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    fetch(`${API_URL}/groups/${groupId}/notifications`, {
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
  const handleSendNotification = () => {
    if (!message.trim()) return;
  fetch(`${API_URL}/notifications/send-notification/${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Notificación del grupo', body: message }) // <- usamos title y body
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Notificación enviada:', data);
      setMessage('');
      if (onNotificationAdded) {
        onNotificationAdded([{ date: new Date().toISOString(), message }]);
      }
    })
    .catch(err => console.error('❌ Error enviando notificación:', err));
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
      <button onClick={() => { handleSend(); handleSendNotification(); }}  >Enviar Notificación</button>
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
