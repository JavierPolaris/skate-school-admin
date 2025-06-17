import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { requestPermissionAndGetToken } from './firebase';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import GroupsPage from './pages/GroupsPage';
import StudentsPage from './pages/StudentsPage';
import EventsPage from './pages/EventsPage';
import TricksPage from './pages/TricksPage';
import DiscountsPage from './pages/DiscountsPage';
import PaymentsPage from './pages/PaymentsPage';
import RequestsPage from './pages/RequestsPage';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentClasses from './pages/StudentClasses';
import StudentPayments from './pages/StudentPayments';
import StudentTricks from './pages/StudentTricks';
import InstallPrompt from './components/InstallPrompt';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    document.body.classList.toggle('admin-mode', storedUser.role === 'admin');
    document.body.classList.toggle('student-mode', storedUser.role === 'student');
  }, [token]);

  // 👉 REGISTRO DEL SERVICE WORKER PARA PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('✅ Service Worker registrado:', reg))
        .catch(err => console.error('❌ Error al registrar Service Worker:', err));
    }
  }, []);
  useEffect(() => {
    requestPermissionAndGetToken();
  }, []);

  return (
    <Router>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<HomePage onLogin={handleLogin} />} />

        <Route
          path="/app/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="tricks" element={<TricksPage />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route
          path="/student/*"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentLayout onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="student-classes" element={<StudentClasses />} />
          <Route path="student-tricks" element={<StudentTricks />} />
          <Route path="student-payments" element={<StudentPayments />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
