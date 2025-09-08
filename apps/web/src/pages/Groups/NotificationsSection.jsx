import { useMemo, useState } from 'react';
import API_URL from '../../config';

function NotificationsSection({ groupId, notifications = [], onNotificationAdded }) {
  const [message, setMessage] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [sending, setSending] = useState(false);

  // ---- util para fechas ----
  const getTime = (n) => {
    if (n?.createdAt) return new Date(n.createdAt).getTime();
    if (n?.date) return new Date(n.date).getTime();
    if (n?._id && typeof n._id === 'string' && n._id.length >= 8) {
      return parseInt(n._id.substring(0, 8), 16) * 1000; // ObjectId -> epoch sec
    }
    return 0;
  };

  // ---- ordenar: recientes primero ----
  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => getTime(b) - getTime(a));
  }, [notifications]);

  const visible = showAll ? sorted : sorted.slice(0, 4);

  // ---- enviar: primero guarda en DB, luego push; actualiza UI una vez ----
  const handleSendBoth = async () => {
    const text = message.trim();
    if (!text || !groupId) return;

    setSending(true);
    try {
      // 1) Guardar en DB
      const res = await fetch(`${API_URL}/groups/${groupId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const updatedGroup = await res.json();

      if (updatedGroup?.notifications && onNotificationAdded) {
        onNotificationAdded(updatedGroup.notifications); // ✅ actualiza lista desde servidor
      }

      // 2) Enviar push (no tocamos estado de la lista para evitar duplicar)
      fetch(`${API_URL}/notifications/send-notification/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Notificación del grupo', body: text }),
      }).catch(() => { /* no pasa nada si falla el push */ });

      setMessage('');
    } catch (err) {
      console.error('❌ Error enviando notificación:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem', marginBlockEnd: '5rem' }}>
      <h4>Notificaciones</h4>

      <textarea
        rows={3}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Escribe una notificación..."
        style={{ width: '-webkit-fill-available' }}
      />

      <br />

      <button onClick={handleSendBoth} disabled={sending}>
        {sending ? 'Enviando...' : 'Enviar Notificación'}
      </button>

      <h5 style={{ marginTop: '1rem' }}>Notificaciones Enviadas:</h5>

      <div
        style={
          showAll
            ? {
                maxHeight: 240,           // altura fija al expandir
                overflowY: 'auto',        // scroll interno
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '8px 12px',
              }
            : undefined
        }
      >
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {sorted && sorted.length > 0 ? (
            visible.map((notif, index) => (
              <li key={notif._id ?? index} style={{ marginBottom: 6 }}>
                <strong>
                  {new Date(notif.createdAt || notif.date || getTime(notif)).toLocaleString()}:
                </strong>{' '}
                {notif.message}
              </li>
            ))
          ) : (
            <p style={{ margin: 0 }}>No hay notificaciones todavía</p>
          )}
        </ul>
      </div>

      {sorted.length > 4 && (
        <button
          type="button"
          className="ver-mas-btn"
          onClick={() => setShowAll(v => !v)}
          aria-expanded={showAll}
          style={{ marginTop: 8 }}
        >
          {showAll ? 'Ocultar' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

export default NotificationsSection;
