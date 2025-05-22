import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MdDashboard, MdLock, MdLogout, MdGroup, MdPayment, MdOutlineSkateboarding } from 'react-icons/md';
import PropTypes from 'prop-types';
import './Layout.css';
import { useSidebar } from '../context/SidebarContext';
import Header from './Header';
import API_URL from '../config';

function StudentLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ name: '', avatar: '' });
  const [activeMenu, setActiveMenu] = useState(location.pathname);
   const { isSidebarOpen, toggleSidebar, setSidebarOpen, closeSidebar } = useSidebar();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!token || !storedUser || storedUser.role !== 'student') {
      navigate('/', { replace: true });
    } else {
      setUserData(storedUser);
    }
  }, []);

useEffect(() => {
  const handleStorageUpdate = () => {
    const key = window.location.pathname.startsWith('/app') ? 'userData' : 'user';
    const storedUser = JSON.parse(localStorage.getItem(key));
    if (storedUser) {
      setUserData(storedUser);
    }
  };

  window.addEventListener('storage', handleStorageUpdate);
  return () => window.removeEventListener('storage', handleStorageUpdate);
}, []);


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
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  return (
     <>
    <Header role="student" onLogout={handleLogout} />
    <div className="layout-container">
      <aside className={`sidebar ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="profile-section">
          <img
            src={
              userData.avatar
                ? `${API_URL}/users/avatar/${userData.avatar}`
                : 'https://via.placeholder.com/50'
            }
            alt="Avatar"
            className="profile-avatar"
          />
          <div className="profile-role-container">
            <p className="profile-role">Alumno</p>
          </div>
          <div className="profile-info">
            <p className="profile-name">{userData.name}</p>
          </div>
        </div>
        <div className="sidebar-content">
        <nav>
          <ul className="menu">
            <li>
              <Link to="/student" className={activeMenu === '/student-dashboard' ? 'active-menu' : ''} onClick={() => handleMenuClick('/student-dashboard')}>
                <MdDashboard size={20} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/student/student-classes" className={activeMenu === '/student-classes' ? 'active-menu' : ''} onClick={() => handleMenuClick('/student-classes')}>
                <MdGroup size={20} /> Clases
              </Link>
            </li>
            <li>
              <Link to="/student/student-tricks" className={activeMenu === '/student-tricks' ? 'active-menu' : ''} onClick={() => handleMenuClick('/student-tricks')}>
                <MdOutlineSkateboarding size={20} /> Trucos
              </Link>
            </li>
            <li>
              <Link to="/student/student-payments" className={activeMenu === '/student-payments' ? 'active-menu' : ''} onClick={() => handleMenuClick('/student-payments')}>
                <MdPayment size={20} /> Pagos
              </Link>
            </li>
            <li>
              <Link to="/student/change-password" className={activeMenu === '/change-password' ? 'active-menu' : ''} onClick={() => handleMenuClick('/change-password')}>
                <MdLock size={20} /> Contraseña
              </Link>
            </li>
            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <MdLogout size={20} /> Cerrar Sesión
            </li>
          </ul>
        </nav>
        <button className="website-button" onClick={() => window.open('https://www.kedekids.com/', '_blank')}>
          🌐 Website
        </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
    </>
  );
}

StudentLayout.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default StudentLayout;
