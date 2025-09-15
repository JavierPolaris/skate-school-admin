import { useState, useEffect } from 'react';
import API_URL from '../config';
import { Link } from 'react-router-dom';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // role del usuario (para mostrar el bloque del customizer solo a admin)
  const role = (() => {
    try { return JSON.parse(localStorage.getItem('user'))?.role; }
    catch { return undefined; }
  })();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const inputStyle = {
    padding: '10px',
    margin: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: isMobile ? '100%' : '200px',
    maxWidth: '100%',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    background: 'linear-gradient(to right, var(--kk-color-primary), var(--kk-color-secondary))',
    border: 'none',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 600,
    margin: '0.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: isMobile ? '100%' : 'auto',
  };

  const sectionStyle = {
    margin: '2rem 0',
    color: 'var(--kk-color-accent)',
    fontSize: '1.5rem',
  };

  const cardStyle = {
    padding: '1rem',
    borderRadius: '12px',
    background: 'var(--kk-color-surface, #f7f7f8)',
    boxShadow: 'var(--kk-shadow, 0 8px 24px rgba(0,0,0,0.08))',
    marginBottom: '1rem'
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) throw new Error('Error al cambiar la contraseña');
      const data = await res.json();
      setMessage(data.message || 'Contraseña actualizada con éxito');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setMessage('Error al cambiar la contraseña');
    }
  };

  const handleAvatarChange = (e) => setAvatar(e.target.files[0]);

  const handleUploadAvatar = async () => {
    if (!avatar) {
      setMessage('Por favor, selecciona una imagen primero.');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', avatar);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/users/upload-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Error al subir el avatar');

      const data = await response.json();

      // 🔄 Actualizamos el localStorage (manteniendo tu lógica actual)
      const userKey = window.location.pathname.startsWith('/app') ? 'userData' : 'user';
      const currentUser = JSON.parse(localStorage.getItem(userKey));
      const updatedUser = { ...currentUser, avatar: data.avatar };
      localStorage.setItem(userKey, JSON.stringify(updatedUser));

      // 🔁 Notificar a los layouts
      window.dispatchEvent(new Event('storage'));

      setMessage('Avatar actualizado correctamente');
    } catch (error) {
      console.error(error);
      setMessage('Error al subir el avatar');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Bloque de acceso al Customizer SOLO para admin */}
      {role === 'admin' && (
        <div style={cardStyle}>
          <h2 style={sectionStyle}>Personalización del tema</h2>
          <p style={{ marginBottom: '0.5rem' }}>
            Cambia colores, tipografías, radios y sombras de la app para adaptarla a la imagen de tu escuela.
          </p>
          <Link to="/app/settings/theme">
            <button style={buttonStyle}>Abrir Customizer</button>
          </Link>
        </div>
      )}

      <h2 style={sectionStyle}>Cambiar Contraseña</h2>
      <input
        type="password"
        placeholder="Contraseña actual"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleChangePassword} style={buttonStyle}>Actualizar Contraseña</button>

      <h2 style={sectionStyle}>Actualizar Avatar</h2>
      <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ margin: '1rem' }} />
      <button onClick={handleUploadAvatar} style={buttonStyle}>Subir Avatar</button>

      {message && <p style={{ color: 'var(--kk-color-primary)', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default ChangePassword;
