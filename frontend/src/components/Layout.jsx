import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import './Layout.css';
import { MdDashboard, MdGroups, MdPerson, MdEvent, MdOutlineSkateboarding, MdDiscount, MdAttachMoney, MdMessage, MdSettings } from 'react-icons/md';
import { useSidebar } from '../context/SidebarContext';
import API_URL from '../config';
import Header from './Header';
function Layout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ name: '', avatar: '' });
  const [activeMenu, setActiveMenu] = useState(location.pathname);
  const { isSidebarOpen, toggleSidebar, setSidebarOpen, closeSidebar } = useSidebar();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.ok ? res.json() : Promise.reject('Error'))
        .then((data) => {
          setUserData(data);
          localStorage.setItem('userData', JSON.stringify(data));
        })
        .catch(console.error);
    }
  }, [navigate, onLogout]);



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true); // 👉 Siempre visible en desktop
      } else {
        setSidebarOpen(false); // 👉 Oculto en móvil hasta que se abra con toggle
      }
    };

    handleResize(); // Ejecutar al cargar

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);


  const handleMenuClick = (path) => {
    setActiveMenu(path);
    if (window.innerWidth <= 768) toggleSidebar(); // 👉 Cerramos la sidebar en móvil
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    onLogout();
    navigate('/');
  };

  const handleDeleteAvatar = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/users/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUserData((prev) => ({ ...prev, avatar: '' }));
        localStorage.setItem('userData', JSON.stringify({ ...userData, avatar: '' }));
      }
    } catch (error) {
      console.error('Error al eliminar avatar:', error);
    }
  };

  return (
    <>
    <Header role="admin" onLogout={handleLogout} />
    <div className="layout-container">
      <aside className={`sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="profile-section">
          <img
            src={
              userData.avatar
                ? `${API_URL}/users/avatar/${userData.avatar}`
                : 'https://via.placeholder.com/50'
            }
            alt="Admin Avatar"
            className="profile-avatar"
          />
          <div className="profile-role-container">
            <p className="profile-role">Admin</p>
            {userData.avatar && (
              <button className="delete-avatar-button" onClick={handleDeleteAvatar}>Eliminar Avatar</button>
            )}
          </div>
          <div className="profile-info">
            <p className="profile-name">{userData.name}</p>
          </div>
        </div>
        <div className="sidebar-content">
          <nav>
            <ul className="menu">
              {/* Aquí no cambio nada, tus enlaces ya están correctos */}
              {[
                { path: '/app', icon: <MdDashboard size={20} />, label: 'Dashboard' },
                { path: '/app/groups', icon: <MdGroups size={20} />, label: 'Grupos' },
                { path: '/app/students', icon: <MdPerson size={20} />, label: 'Alumnos' },
                { path: '/app/events', icon: <MdEvent size={20} />, label: 'Eventos' },
                { path: '/app/tricks', icon: <MdOutlineSkateboarding size={20} />, label: 'Trucos' },
                { path: '/app/discounts', icon: <MdDiscount size={20} />, label: 'Descuentos' },
                { path: '/app/payments', icon: <MdAttachMoney size={20} />, label: 'Pagos' },
                { path: '/app/requests', icon: <MdMessage size={20} />, label: 'Messages' },
                { path: '/app/change-password', icon: <MdSettings size={20} />, label: 'Settings' },
              ].map(({ path, icon, label }) => (
                <li key={path}>
                  <Link to={path} className={activeMenu === path ? 'active-menu' : ''} onClick={() => handleMenuClick(path)}>
                    {icon} {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button className="website-button" onClick={() => window.open('https://www.kedekids.com/', '_blank')}>
            🌐 Website
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
    </>
  );
}

Layout.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default Layout;
