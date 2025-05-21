import { useEffect, useState } from 'react';

import '../css/StudentPayments.css'; // Crea este archivo para estilos si no existe

function StudentPayments() {
  const [showReminder, setShowReminder] = useState(false);
  const [payments, setPayments] = useState([]);
  const [user, setUser] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [paymentConfigs, setPaymentConfigs] = useState({});


  useEffect(() => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    if (day >= 1 && day <= 15) {
      setShowReminder(true);
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('User ID:', storedUser.id);
    setUser(storedUser);

    fetch('http://localhost:5000/api/payments')
      .then(res => res.json())
      .then(data => {
        const configs = {};
        data.forEach(cfg => {
          configs[cfg.method] = cfg;
        });
        setPaymentConfigs(configs);
      })
      .catch(err => console.error('Error cargando configuración de pagos:', err));

    // Simula la obtención de pagos desde el backend
    fetch(`http://localhost:5000/api/users/payments-history/${storedUser.id}`)
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(err => console.error('Error cargando pagos:', err));
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMethod('');
  };

  const filteredPayments = payments.filter(payment => {
    const paymentMonth = new Date(payment.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const matchesMonth = selectedMonth ? paymentMonth === selectedMonth : true;
    const matchesMethod = selectedMethod ? payment.method === selectedMethod : true;
    return matchesMonth && matchesMethod;
  });


  return (
    <div className="student-dashboard" style={{ padding: '2rem', color: '#fff' }}>
      {showReminder && (
        <div className="payment-reminder">
          📢 ¡Recuerda realizar el pago de la matrícula antes del 15 de este mes!
        </div>
      )}

     <div style={{
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '2rem',
  color: '#fff'
}}>
  <h3 style={{ color: '#ff9b00', marginBottom: '1rem' }}>💳 Información de Métodos de Pago</h3>

  {['efectivo', 'bizum', 'transferencia'].map(method => (
    paymentConfigs[method] && (
      <div key={method} style={{ marginTop: '1rem' }}>
        <h4 style={{ color: '#ff9b00', marginBottom: '0.5rem' }}>
          {method.charAt(0).toUpperCase() + method.slice(1)}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginLeft: '1rem' }}>
          {paymentConfigs[method].phone && (
            <span>📱 <strong>Teléfono:</strong> {paymentConfigs[method].phone}</span>
          )}
          {paymentConfigs[method].accountNumber && (
            <span>🏦 <strong>Nº de Cuenta:</strong> {paymentConfigs[method].accountNumber}</span>
          )}
          {paymentConfigs[method].subject && (
            <span>📄 <strong>Asunto:</strong> {paymentConfigs[method].subject}</span>
          )}
          {paymentConfigs[method].message && (
            <span>📢 <strong>Mensaje:</strong> {paymentConfigs[method].message}</span>
          )}
        </div>
      </div>
    )
  ))}
</div>



      <h2 style={{ color: '#ff9b00' }}>Tus Pagos</h2>

      {/* Filtros */}
      <div className="tricks-filters">
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="filter-button selected"
          style={{
            border: '1px solid #555',
            background: 'transparent',
            color: 'white',
            borderRadius: '20px',
            padding: '8px 12px',
            marginRight: '10px',
          }}
        >
          <option value="">Formas de Pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="bizum">Bizum</option>
          <option value="transferencia">Transferencia</option>
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="filter-button selected"
          style={{
            border: '1px solid #555',
            background: 'transparent',
            color: 'white',
            borderRadius: '20px',
            padding: '8px 12px',
            marginRight: '10px',
          }}
        >
          <option value="">Meses</option>
          {Array.from(new Set(payments.map(payment =>
            new Date(payment.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' })
          ))).map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <button className="filter-button" onClick={() => { setSelectedMethod(''); setSelectedMonth(''); }}>
          Limpiar Filtros
        </button>
      </div>


      {/* Tabla con Scroll */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: '#1e1e2f',
        marginBlockEnd: '25%',
      }}>
        {filteredPayments.length ? (
          <table className="payments-table" style={{ width: '100%', color: '#fff' }}>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Forma de Pago</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={index}>
                  <td>{new Date(payment.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</td>
                  <td>{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay pagos registrados aún.</p>
        )}
      </div>
    </div>
  );
}

export default StudentPayments;