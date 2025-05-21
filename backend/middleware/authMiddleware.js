const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Token faltante' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token inválido' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Error en el middleware de autenticación:', err);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware adicional para autorizar por rol
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
