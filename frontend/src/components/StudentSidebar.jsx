import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdLock, MdLogout, MdGroup, MdPayment } from 'react-icons/md';
import '../css/Sidebar.css'; // Crea este CSS para estilos si no lo tienes

const StudentSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="layout-container">
            <div className="sidebar">
                <h3>Menú Alumno</h3>
                <ul>
                    <li onClick={() => navigate('/student-dashboard')}>
                        <MdDashboard /> Dashboard
                    </li>
                    <li onClick={() => navigate('/change-password')}>
                        <MdLock /> Cambiar Contraseña
                    </li>
                    <li onClick={() => navigate('/student-classes')}>
                        <MdGroup /> Ver Clases
                    </li>
                    <li onClick={() => navigate('/student-payments')}>
                        <MdPayment /> Pagos
                    </li>
                    <li onClick={handleLogout}>
                        <MdLogout /> Cerrar Sesión
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StudentSidebar;
