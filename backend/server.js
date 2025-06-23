// server.js
require('dotenv').config();

// Primero las dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
}).catch((err) => {
    console.error('Error de conexión a MongoDB:', err);
});

// Modelos
require('./models/User');  
require('./models/Group'); 

// Rutas
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const eventsRouter = require('./routes/events');
const notificationsRoutes = require('./routes/notifications'); 
const tricksRouter = require('./routes/tricks');
const paymentRoutes = require('./routes/payments');

// App de Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tricks', tricksRouter);
app.use('/api/payments', paymentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de prueba
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Middleware de autenticación (si lo usas)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};



// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
