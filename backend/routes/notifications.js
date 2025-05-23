const express = require("express");
const router = express.Router();
const admin = require("../firebase"); // Importa la configuración de Firebase
const Group = require('../models/Group');


// Obtener notificaciones de un grupo
router.get('/:groupId', async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    res.json(group.notifications || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificaciones del grupo' });
  }
});

// Guardar token de dispositivo
router.put('/save-device-token', async (req, res) => {
  console.log('Body recibido:', req.body);

  const { email, deviceToken } = req.body;
  
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { deviceToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Token guardado con éxito', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el token' });
  }
});

// Enviar notificación push
router.post('/send-notification', async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ success: false, message: 'Tokens must be a non-empty array' });
  }

  const message = {
    notification: { title, body },
    tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    res.status(500).json({ success: false, message: 'Error sending notification', error });
  }
});

// Enviar notificación a todos los miembros de un grupo
router.post('/send-notification/:groupId', async (req, res) => {
  const { title, body } = req.body;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).populate('members');
    if (!group || !group.members.length) {
      return res.status(404).json({ error: 'Grupo no encontrado o sin miembros' });
    }

    const tokens = group.members.map(m => m.deviceToken).filter(Boolean);

    if (!tokens.length) {
      return res.status(400).json({ success: false, message: 'No hay tokens disponibles' });
    }

    const message = {
      notification: { title, body },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    res.status(500).json({ success: false, message: 'Error al enviar notificación', error });
  }
});


module.exports = router;