const express = require("express");
const router = express.Router();
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const admin = require("../firebase"); // Importa la configuración de Firebase
const Group = require('../models/Group');
const User = require("../models/User");


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
    return res.status(400).send({ success: false, message: 'Tokens must be a non-empty array' });
  }

  const message = {
    notification: { title, body },
    tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.json({ success: true, response });
  } catch (err) {
    console.error('Error enviando notificación:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Enviar notificación push a todos los miembros de un grupo
router.post("/send-notification/:groupId", async (req, res) => {
  const { title, body } = req.body;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).populate("members");
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });

    // Filtra tokens válidos de Expo
    const tokens = group.members
      .map(m => m.deviceToken)
      .filter(Expo.isExpoPushToken);

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: "No hay tokens de Expo disponibles" });
    }

    // Prepara los mensajes
    const messages = tokens.map(token => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { groupId },
    }));

    // Envia en chunks (100 máximo c/u)
    let tickets = [];
    for (let chunk of expo.chunkPushNotifications(messages)) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return res.json({
      success: true,
      tickets,
      message: `Intentadas ${messages.length} notificaciones`,
    });
  } catch (err) {
    console.error("❌ Error enviando notificación:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});




module.exports = router;