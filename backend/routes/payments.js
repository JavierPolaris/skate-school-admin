// File: backend/routes/payment.js

const express = require('express');
const router = express.Router();
const PaymentConfig = require('../models/PaymentConfig');
const Payment = require('../models/Payment');

const User = require('../models/User');


// Obtener Configuración de Pagos
router.get('/', async (req, res) => {
  try {
    const configs = await PaymentConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar o Crear Configuración de Pago
router.post('/', async (req, res) => {
  const { method, message, phone, accountNumber, subject } = req.body;
  try {
    let config = await PaymentConfig.findOne({ method });
    if (config) {
      config.message = message;
      config.phone = phone;
      config.accountNumber = accountNumber;
      config.subject = subject;
    } else {
      config = new PaymentConfig({ method, message, phone, accountNumber, subject });
    }
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar Notificación a Todos los Alumnos
router.post('/notify', async (req, res) => {
  const { notificationMessage } = req.body;

  try {
    const configs = await PaymentConfig.find();
    const students = await User.find({ role: 'student' });

    // Generar el contenido dinámico del mensaje
    const paymentDetails = configs.map(cfg => {
      switch (cfg.method) {
        case 'efectivo':
          return `💵 *Efectivo*: ${cfg.message || 'Consulta con tu monitor.'}`;
        case 'bizum':
          return `📱 *Bizum*: Enviar al número ${cfg.phone || 'No definido'}. ${cfg.message || ''}`;
        case 'transferencia':
          return `🏦 *Transferencia*: Nº Cuenta: ${cfg.accountNumber || 'No definido'}, Asunto: ${cfg.subject || 'No definido'}. ${cfg.message || ''}`;
        default:
          return '';
      }
    }).join('\n\n');

    const fullMessage = `${notificationMessage}\n\n📢 *Formas de Pago:*\n\n${paymentDetails}`;

    // Enviar la notificación a todos los alumnos (puedes adaptarlo a tu sistema real de notificaciones)
    await Promise.all(students.map(student => {
      student.notifications = student.notifications || [];
      student.notifications.push({ date: new Date(), message: fullMessage });
      return student.save();
    }));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Obtener el historial de pagos de un alumno
router.get('/:userId', async (req, res) => {
  try {
    const payments = await PaymentHistory.find({ userId: req.params.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});


// Obtener todos los pagos (para Admin)
router.get('/', async (req, res) => {
  try {
    const payments = await PaymentHistory.find().populate('userId', 'name email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Registrar un nuevo pago
router.post('/register', async (req, res) => {
  const { userId, method } = req.body;

  try {
    const payment = new PaymentHistory({ userId, method, date: new Date() }); // Se incluye la fecha de pago
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el pago' });
  }
});

module.exports = router;
