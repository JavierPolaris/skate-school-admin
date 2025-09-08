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
  const [lastSeenTs, setLastSeenTs] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userData, setUserData] = useState({ _id: '', role: '', name: '', avatar: '' });

  const navigate = useNavigate();
  const bellRef = useRef(null);
  const userMenuRef = useRef(null);
  const pollRef = useRef(null);

  const READ_KEY = userData?._id ? `kk_last_seen_notif_${userData._id}` : null;

  const getTime = (n) => {
    if (n?.createdAt) return new Date(n.createdAt).getTime();
    if (n?.date) return new Date(n.date).getTime();
    if (n?._id && typeof n._id === 'string' && n._id.length >= 8) {
      return parseInt(n._id.substring(0, 8), 16) * 1000;
    }
    return 0;
  };

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => getTime(b) - getTime(a));
  }, [notifications]);

  const latest = sortedNotifications[0] || null;
  const latestTime = latest ? getTime(latest) : 0;
  const hasNew = latestTime > lastSeenTs;
  const unreadCount = hasNew ? 1 : 0;

  useEffect(() => {
    (async () => {
      axios.get(`${API_URL}/users/requests`).then((res) => {
        setMessageCount(Array.isArray(res.data) ? res.data.length : 0);
      }).catch(() => {});

      const stored = localStorage.getItem('user') || localStorage.getItem('userData');
      if (stored) {
        const u = JSON.parse(stored);
        setUserData(u);

        if (READ_KEY) {
          const saved = parseInt(localStorage.getItem(READ_KEY) || '0', 10);
          setLastSeenTs(Number.isFinite(saved) ? saved : 0);
        }

        await fetchNotifications(u);

        if (u?.role === 'student' && u?.groupId?._id) {
          pollRef.current = setInterval(() => fetchNotifications(u), 30000);
        }
      }
    })();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async (u) => {
    try {
      let groupNotes = [];
      if (u?.role === 'student' && u?.groupId?._id) {
        const res = await axios.get(`${API_URL}/notifications/${u.groupId._id}`);
        groupNotes = Array.isArray(res.data) ? res.data : [];
      }

      // 🔔 Aviso pagos con createdAt ESTABLE (25 del mes, 00:00 local)
      const now = new Date();
      const day = now.getDate();
      const payday = new Date(now.getFullYear(), now.getMonth(), 25, 0, 0, 0, 0);
      const synthetic = day >= 25
        ? [{
            _id: `payment-${now.getFullYear()}-${now.getMonth() + 1}`,
            message: 'Comienzo fecha de pagos',
            createdAt: payday.toISOString(),
          }]
        : [];

      setNotifications([...groupNotes, ...synthetic]);
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
    }
  };

  // ✅ Marca como leído ANTES de abrir (para que el punto desaparezca al instante)
  const onBellClick = () => {
    if (!showNotifications && hasNew && READ_KEY) {
      const ts = latestTime || Date.now();
      setLastSeenTs(ts);
      localStorage.setItem(READ_KEY, String(ts));
    }
    setShowNotifications(v => !v);
  };

  const handleClickOutside = (e) => {
    if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifications(false);
    if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() && role !== 'student') {
      try {
        const response = await axios.get(`${API_URL}/users/search`, { params: { query: term } });
        const combined = [
          ...response.data.users.map((u) => ({ ...u, type: 'user' })),
          ...response.data.groups.map((g) => ({ ...g, type: 'group' })),
          ...response.data.events.map((ev) => ({ ...ev, type: 'event' })),
        ];
        setSearchResults(combined);
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
          onClick={onBellClick}
          ref={bellRef}
        >
          <FaBell />
          {unreadCount > 0 && <span className="notification-dot"></span>}
          {showNotifications && (
            <div className="dropdown">
              {hasNew && latest
                ? <p key={latest._id}>🔔 {latest.message}</p>
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
