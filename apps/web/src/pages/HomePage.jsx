import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { loginUser } from '@shared/api';



function HomePage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
useEffect(() => {
  try {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  } catch (err) {
    console.warn('Error accediendo a localStorage:', err);
  }
}, []);

  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  

  useEffect(() => {
    // Añadir clase 'login-background' al body si no hay token
    if (!token) {
      document.body.classList.add('login-background');
    } else {
      document.body.classList.remove('login-background');
    }

    // Limpiar al desmontar el componente
    return () => {
      document.body.classList.remove('login-background');
    };
  }, [token]);

useEffect(() => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin') {
        navigate('/app', { replace: true });
      } else if (user.role === 'student') {
        navigate('/student', { replace: true });
      }
    }
  } catch (err) {
    console.warn('Error al recuperar token o user:', err);
  }
}, [navigate]);


  const handleLogin = async () => {
  try {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onLogin(data.token);

    if (data.user.role === 'admin') {
      navigate('/app');
    } else if (data.user.role === 'student') {
      navigate('/student-dashboard');
    }
  } catch (err) {
    setError(err.message || 'Error al conectar con el servidor');
  }
};

  const handleRequestAccess = async () => {
    try {
      const response = await fetch(`${API_URL}/users/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: requestName, email: requestEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        setRequestMessage('Solicitud enviada con éxito. El administrador revisará tu solicitud.');
      } else {
        setRequestMessage(data.error || 'Error al enviar la solicitud.');
      }
    } catch (err) {
      setRequestMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="login">
      <div className='paddinglog'>
        {/* LOGO Kedekids */}
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <img 
        src="https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png" 
        alt="Logo Kedekids" 
        style={{ maxWidth: '200px', height: 'auto' }} 
      />
    </div>
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ margin: '0.5rem' }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ margin: '0.5rem' }}
        />
        <br />
        <button onClick={handleLogin} >Entrar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="acceso" style={{ marginTop: '1rem' }}>
          <p>¿No tienes acceso?</p>
          {/* Solicitud de acceso */}
          <button  onClick={() => setShowRequestModal(true)}>Solicitar acceso</button>
          {showRequestModal && (
            <div className="modal">
              <h3>Solicitud de Acceso</h3>
              <input
                type="text"
                placeholder="Nombre completo"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
              />
              <button onClick={handleRequestAccess}>Enviar Solicitud</button>
              <button onClick={() => setShowRequestModal(false)}>Cancelar</button>
              {requestMessage && <p>{requestMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
