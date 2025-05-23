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
    return res.status(400).send({ success: false, message: 'Tokens must be a non-empty array' });
  }

  const message = {
    notification: { title, body },
    tokens, // 👈 Aquí puedes mandar 1 o varios
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.send({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    });
  } catch (err) {
    console.error('🔥 Error enviando notificación:', err);
    res.status(500).send({ success: false, message: 'Error al enviar notificaciones' });
  }
});



module.exports = router;