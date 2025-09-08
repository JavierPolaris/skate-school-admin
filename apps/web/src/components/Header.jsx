import { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBell, FaEnvelope, FaCaretDown } from 'react-icons/fa';
import '../css/Dashboard.css';
import { useSidebar } from '../context/SidebarContext';
import API_URL from '../config';

const Header = ({ role }) => {
  const { toggleSidebar } = useSidebar();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [messageCount, setMessageCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ _id: '', name: '', avatar: '' });

  const navigate = useNavigate();
  const bellRef = useRef(null);
  const userMenuRef = useRef(null);

  // --------- Helpers para "leídos" por usuario ----------
  const READ_KEY = userData?._id ? `kk_read_notifs_${userData._id}` : null;
  const loadReadSet = () => {
    if (!READ_KEY) return new Set();
    try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); }
    catch { return new Set(); }
  };
  const saveReadSet = (set) => {
    if (!READ_KEY) return;
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
  };

  // --------- Carga inicial ----------
  useEffect(() => {
    (async () => {
      try {
        // Peticiones pendientes
        axios.get(`${API_URL}/users/requests`).then((response) => {
          setMessageCount(response.data.length);
        }).catch(()=>{});

        // Usuario
        const stored = localStorage.getItem('user') || localStorage.getItem('userData');
        if (stored) {
          const u = JSON.parse(stored);
          setUserData(u);

          // Notificaciones del grupo (para alumnos)
          let groupNotes = [];
          if (u?.role === 'student' && u?.groupId?._id) {
            try {
              const res = await axios.get(`${API_URL}/notifications/${u.groupId._id}`);
              groupNotes = Array.isArray(res.data) ? res.data : [];
            } catch (e) {
              console.error('Error cargando notificaciones de grupo:', e);
            }
          }

          // Aviso de pagos (sintético)
          const day = new Date().getDate();
          const synthetic = (day >= 25)
            ? [{
                _id: `payment-${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
                message: 'Comienzo fecha de pagos',
                createdAt: new Date().toISOString(),
              }]
            : [];

          setNotifications([...groupNotes, ...synthetic]);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // --------- Ordenar: recientes primero ----------
  const sortedNotifications = useMemo(() => {
    const getTime = (n) => {
      if (n?.createdAt) return new Date(n.createdAt).getTime();
      if (n?.date) return new Date(n.date).getTime();
      if (n?._id && typeof n._id === 'string' && n._id.length >= 8) {
        return parseInt(n._id.substring(0, 8), 16) * 1000; // timestamp de ObjectId
      }
      return 0;
    };
    return [...notifications].sort((a, b) => getTime(b) - getTime(a));
  }, [notifications]);

  // --------- Calcular no leídas ----------
  useEffect(() => {
    if (!userData?._id) return;
    const read = loadReadSet();
    const count = sortedNotifications.filter(n => n?._id && !read.has(n._id)).length;
    setUnreadCount(count);
  }, [sortedNotifications, userData?._id]);

  // --------- Marcar como leídas al abrir dropdown ----------
  useEffect(() => {
    if (!showNotifications || !userData?._id) return;
    const read = loadReadSet();
    for (const n of sortedNotifications) if (n?._id) read.add(n._id);
    saveReadSet(read);
    setUnreadCount(0);
  }, [showNotifications, sortedNotifications, userData?._id]);

  // --------- Búsqueda ----------
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() && role !== 'student') {
      try {
        const response = await axios.get(`${API_URL}/users/search`, { params: { query: term } });
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

      {/* Search (oculta para students) */}
      <div className="search-bar">
        {role !== 'student' && (
          <>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="search-results">
              {searchResults.map((result, index) => (
                <p
                  key={index}
                  onClick={() => {
                    if (result.type === 'user') navigate(`/app/students?userId=${result._id}`);
                    if (result.type === 'group') navigate(`/app/groups?groupId=${result._id}`);
                    if (result.type === 'event') navigate(`/app/events?eventId=${result._id}`);
                  }}
                >
                  {result.type === 'user' && `Usuario: ${result.name} (${result.email})`}
                  {result.type === 'group' && `Grupo: ${result.name}`}
                  {result.type === 'event' && `Evento: ${result.name}`}
                </p>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="header-icons">
        {/* Campana para TODOS los roles */}
        <div
          className={`icon-container ${showNotifications ? 'show-dropdown' : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}
          ref={bellRef}
        >
          <FaBell />
          {unreadCount > 0 && <span className="notification-dot"></span>}
          {showNotifications && (
            <div className="dropdown">
              {sortedNotifications.length
                ? sortedNotifications.map((note, i) => (
                    <p key={note._id ?? i}>🔔 {note.message}</p>
                  ))
                : <p>No hay avisos</p>}
            </div>
          )}
        </div>

        {/* Solo admin: bandeja de solicitudes */}
        {role === 'admin' && (
          <div className="icon-container" onClick={() => navigate('/app/requests')}>
            <FaEnvelope />
            {messageCount > 0 && <span className="message-count">{messageCount}</span>}
          </div>
        )}

        <div className="user-menu" onClick={handleAvatarClick}>
          <img
            src={
              userData.avatar
                ? (userData.avatar.startsWith('http')
                  ? userData.avatar
                  : `${API_URL}/users/avatar/${userData.avatar}`)
                : 'https://via.placeholder.com/40'
            }
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
