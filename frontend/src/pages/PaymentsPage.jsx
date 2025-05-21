import { useEffect, useState } from 'react';

import '../css/PaymentsPage.css';
import API_URL from '../config';

function PaymentsPage() {
  const [paymentConfigs, setPaymentConfigs] = useState({});
  const [notificationMessage, setNotificationMessage] = useState('');
  const [allPayments, setAllPayments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  

  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    // Cargar configuración de métodos de pago
    fetch(`${API_URL}/api/payments`)
      .then(res => res.json())
      .then(data => {
        const configs = {};
        data.forEach(cfg => {
          configs[cfg.method] = cfg;
        });
        setPaymentConfigs(configs);
      })
      .catch(err => console.error(err));

    // Cargar histórico de pagos
    fetch(`${API_URL}/api/users/payments-history`)

      .then(res => res.json())
      .then(data => setAllPayments(data))
      .catch(err => console.error(err));
  }, []);

  const handlePaymentChange = (method, field, value) => {
    setPaymentConfigs(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value,
      },
    }));
  };

  const handleSaveAndNotify = () => {
    const paymentMethods = ['efectivo', 'bizum', 'transferencia'];

    Promise.all(
      paymentMethods.map(method => {
        const config = paymentConfigs[method] || {};
        return fetch(`${API_URL}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, ...config }),
        });
      })
    )
      .then(() => {
        return fetch(`${API_URL}/api/payments/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationMessage }),
        });
      })
      .then(res => res.json())
      .then(() => {
        alert('Configuración guardada y notificación enviada.');
        setNotificationMessage('');
      })
      .catch(err => console.error(err));
  };
  useEffect(() => {
    fetch(`${API_URL}/api/payments`)
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(err => console.error(err));
  }, []);



  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMethod('');
  };

  // Filtro aplicado en el renderizado de la tabla
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      || payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod ? payment.method === selectedMethod : true;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="payments-page">
      <h2>Gestión de Pagos</h2>

      <h3>Mensaje de Notificación Global</h3>
      <textarea
        rows="4"
        placeholder="Mensaje para todos los alumnos..."
        value={notificationMessage}
        onChange={(e) => setNotificationMessage(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />

      <h3>Configuración de Métodos de Pago</h3>

      {/* Efectivo */}
      <section>
        <h4>Efectivo</h4>
        <textarea
          rows="2"
          placeholder="Mensaje para método efectivo..."
          value={paymentConfigs['efectivo']?.message || ''}
          onChange={(e) => handlePaymentChange('efectivo', 'message', e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
      </section>

      {/* Bizum */}
      <section>
        <h4>Bizum</h4>
        <input
          type="text"
          placeholder="Teléfono para Bizum"
          value={paymentConfigs['bizum']?.phone || ''}
          onChange={(e) => handlePaymentChange('bizum', 'phone', e.target.value)}
        />
        <textarea
          rows="2"
          placeholder="Mensaje para método Bizum..."
          value={paymentConfigs['bizum']?.message || ''}
          onChange={(e) => handlePaymentChange('bizum', 'message', e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
      </section>

      {/* Transferencia */}
      <section>
        <h4>Transferencia</h4>
        <input
          type="text"
          placeholder="Número de cuenta"
          value={paymentConfigs['transferencia']?.accountNumber || ''}
          onChange={(e) => handlePaymentChange('transferencia', 'accountNumber', e.target.value)}
        />
        <input
          type="text"
          placeholder="Asunto de la transferencia"
          value={paymentConfigs['transferencia']?.subject || ''}
          onChange={(e) => handlePaymentChange('transferencia', 'subject', e.target.value)}
        />
        <textarea
          rows="2"
          placeholder="Mensaje para método Transferencia..."
          value={paymentConfigs['transferencia']?.message || ''}
          onChange={(e) => handlePaymentChange('transferencia', 'message', e.target.value)}
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
      </section>

      <br />
      <button onClick={handleSaveAndNotify}>💾 Guardar Todo y Notificar</button>

      <h3 style={{ marginTop: '3rem' }}>📊 Histórico de Pagos de Alumnos</h3>
      {/* Filtros */}
      <div className="tricks-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '30%',
            padding: '8px 12px',
            borderRadius: '20px',
            border: '1px solid #555',
            background: 'transparent',
            color: 'white',
            marginRight: '10px',
            fontFamily: 'Quicksand, sans-serif'
          }}
        />
        <button
          className={`filter-button ${selectedMethod === '' ? 'active-filtro' : ''}`}
          onClick={() => setSelectedMethod('')}
        >
          Todos
        </button>
        <button
          className={`filter-button ${selectedMethod === 'efectivo' ? 'active-filtro' : ''}`}
          onClick={() => setSelectedMethod('efectivo')}
        >
          Efectivo
        </button>
        <button
          className={`filter-button ${selectedMethod === 'bizum' ? 'active-filtro' : ''}`}
          onClick={() => setSelectedMethod('bizum')}
        >
          Bizum
        </button>
        <button
          className={`filter-button ${selectedMethod === 'transferencia' ? 'active-filtro' : ''}`}
          onClick={() => setSelectedMethod('transferencia')}
        >
          Transferencia
        </button>
        <button className="filter-button" onClick={handleClearFilters}>
          Limpiar Filtros
        </button>
      </div>


      {/* Scrollable Histórico */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {filteredPayments.length ? (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Email</th>
                <th>Mes</th>
                <th>Forma de Pago</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.userId?.name || 'Desconocido'}</td>
                  <td>{payment.userId?.email || 'Desconocido'}</td>
                  <td>{new Date(payment.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</td>
                  <td>{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay pagos registrados.</p>
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;
