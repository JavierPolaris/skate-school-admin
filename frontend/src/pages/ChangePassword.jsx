import { useState, useEffect } from 'react';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    background: 'linear-gradient(to right, #FF4081, #007997)',
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
    color: '#FF9B00',
    fontSize: '1.5rem',
  };

  const handleChangePassword = async () => { /* ... Tu código de cambio de contraseña ... */ };
  const handleAvatarChange = (e) => setAvatar(e.target.files[0]);
  const handleUploadAvatar = async () => { /* ... Tu código de subida de avatar ... */ };

  return (
    <div style={{ padding: '2rem' }}>
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

      {message && <p style={{ color: '#FF4081', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default ChangePassword;
