const API_URL = 'https://skate-school-admin.onrender.com/api';

// Login
export const loginUser = async (email, password) => {
  console.log('📡 LoginUser payload:', { email, password });

  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  console.log('📥 LoginUser raw response:', text);

  let result;
  try {
    result = JSON.parse(text);
  } catch (err) {
    throw new Error(text); // si no es JSON, lanza el texto tal cual
  }

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result;
};

// Obtener perfil del usuario
export const getUserProfile = async (token) => {
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to get profile');
  return await res.json();
};

// Listado de clases o eventos
export const fetchEvents = async () => {
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return await res.json();
};

// Obtener detalles del grupo
export const getGroupDetails = async (groupId) => {
  const res = await fetch(`${API_URL}/groups/${groupId}`);
  if (!res.ok) throw new Error('Error al obtener los detalles del grupo');
  return await res.json();
};

// Obtener próximas clases del grupo
export const getUpcomingClasses = async (groupId) => {
  const res = await fetch(`${API_URL}/groups/upcoming-classes/${groupId}`);
  if (!res.ok) throw new Error('Error al obtener las próximas clases');
  return await res.json();
};

// Obtener notificaciones del grupo
export const getGroupNotifications = async (groupId) => {
  const res = await fetch(`${API_URL}/notifications/${groupId}`);
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return await res.json();
};
