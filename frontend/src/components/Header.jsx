import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBell, FaEnvelope, FaCaretDown } from 'react-icons/fa';
import '../css/Dashboard.css';
import { useSidebar } from '../context/SidebarContext'; // ✅ Importa el contexto
import API_URL from '../config';

const Header = ({ role }) => {
  const { toggleSidebar } = useSidebar(); // ✅ Obtiene la función del contexto

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ name: '', avatar: '' });

  const navigate = useNavigate();
  const bellRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/users/requests`).then((response) => {
      setMessageCount(response.data.length);
    });

   const storedUserData = localStorage.getItem('user') || localStorage.getItem('userData');
if (storedUserData) setUserData(JSON.parse(storedUserData));


    const day = new Date().getDate();
    setNotifications(day >= 25 ? ['Comienzo fecha de pagos'] : []);
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      try {
        const response = await axios.get(`${API_URL}/api/users/search`, { params: { query: term } });
        const combinedResults = [
          ...response.data.users.map((u) => ({ ...u, type: 'user' })),
          ...response.data.groups.map((g) => ({ ...g, type: 'group' })),
          ...response.data.events.map((ev) => ({ ...ev, type: 'event' })),
        ];
        setSearchResults(combinedResults);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAvatarClick = () => setShowUserMenu(!showUserMenu);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleClickOutside = (e) => {
    if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifications(false);
    if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dashboard-header dashboard-container">
      <div className="hamburger-menu" onClick={toggleSidebar}>☰</div>

      <div className="header-left">

        <img
          src="https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png"
          alt="Logo Kedekids"
          className="logo-kedekids"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(role === 'admin' ? '/app' : '/student')}
        />
        <div className="calendario hide-on-mobile">
          <FaCalendarAlt /> <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="reloj hide-on-mobile">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="search-results">
          {searchResults.map((result, index) => (
            <p key={index} onClick={() => {
              if (result.type === 'user') navigate(`/app/students?userId=${result._id}`);
              if (result.type === 'group') navigate(`/app/groups?groupId=${result._id}`);
              if (result.type === 'event') navigate(`/app/events?eventId=${result._id}`);
            }}>
              {result.type === 'user' && `Usuario: ${result.name} (${result.email})`}
              {result.type === 'group' && `Grupo: ${result.name}`}
              {result.type === 'event' && `Evento: ${result.name}`}
            </p>
          ))}
        </div>
      </div>

      <div className="header-icons">
        {role === 'admin' && (
          <>
            <div className={`icon-container ${showNotifications ? 'show-dropdown' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {notifications.length > 0 && <span className="notification-dot"></span>}
              {showNotifications && (
                <div className="dropdown" ref={bellRef}>
                  {notifications.length ? notifications.map((note, i) => <p key={i}>{note}</p>) : <p>No hay avisos</p>}
                </div>
              )}
            </div> 

            <div className="icon-container" onClick={() => navigate('/app/requests')}>
              <FaEnvelope />
              {messageCount > 0 && <span className="message-count">{messageCount}</span>}
            </div>
          </>
        )}

        <div className="user-menu" onClick={handleAvatarClick}>
          <img
            src={userData.avatar ? `${API_URL}/api/users/avatar/${userData.avatar}` : 'https://via.placeholder.com/40'}
            alt="Avatar"
            className="profile-avatar2"
          />
          <span>{userData.name} <FaCaretDown /></span>
          {showUserMenu && (
            <div className="dropdown" ref={userMenuRef}>
              <p onClick={() => navigate(role === 'admin' ? '/app/change-password' : '/change-password')}>
                Cambiar Contraseña
              </p>
              <p onClick={handleLogout}>Cerrar Sesión</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
