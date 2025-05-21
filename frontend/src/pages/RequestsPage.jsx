import { useState, useEffect } from 'react';
import API_URL from '../config';

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [roleSelections, setRoleSelections] = useState({}); // Almacena los roles seleccionados por cada solicitud

  useEffect(() => {
    fetch(`${API_URL}/users/requests`)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
  }, []);

  const handleRoleChange = (id, selectedRole) => {
    setRoleSelections(prev => ({ ...prev, [id]: selectedRole }));
  };

  const handleUpdateRequest = (id, status) => {
    const selectedRole = roleSelections[id] || 'student'; // Por defecto 'student' si no selecciona nada

   fetch(`${API_URL}/users/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, role: selectedRole }),
    })
      .then(res => res.json())
      .then(() => {
        setRequests(prev => prev.filter(req => req._id !== id));
        setRoleSelections(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Solicitudes de Acceso</h2>
      <ul>
        {requests.map(request => (
          <li key={request._id}>
            <p>Nombre: {request.name}</p>
            <p>Email: {request.email}</p>

            <label>Asignar Rol: </label>
            <select
              value={roleSelections[request._id] || 'student'}
              onChange={e => handleRoleChange(request._id, e.target.value)}
            >
              <option value="student">Alumno</option>
              <option value="admin">Administrador</option>
            </select>

            <br />
            <button onClick={() => handleUpdateRequest(request._id, 'approved')}>
              Aprobar
            </button>
            <button onClick={() => handleUpdateRequest(request._id, 'rejected')}>
              Rechazar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RequestsPage;
