const express = require("express");
const router = express.Router();
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

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

// Enviar notificación push a todos los miembros de un grupo
router.post("/send-notification/:groupId", async (req, res) => {
  const { title, body } = req.body;
  const { groupId } = req.params;

  try {
    console.log(`Iniciando envío de notificación al grupo ${groupId} con título: "${title}" y cuerpo: "${body}"`);

    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      console.error(`❌ Grupo con ID ${groupId} no encontrado`);
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    console.log(`Grupo encontrado. Miembros: ${group.members.length}`);

    const tokens = group.members
      .map(m => m.deviceToken)
      .filter(Expo.isExpoPushToken);

    console.log(`Tokens de Expo encontrados: ${tokens.length}`);

    if (tokens.length === 0) {
      console.warn("❌ No hay tokens de Expo disponibles");
      return res.status(400).json({ success: false, message: "No hay tokens de Expo disponibles" });
    }

    const messages = tokens.map(token => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { groupId },
    }));

    console.log("Mensajes preparados para envío:", messages);

    let tickets = [];
    for (let chunk of expo.chunkPushNotifications(messages)) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log(`Enviado chunk de ${ticketChunk.length} notificaciones`);
      } catch (err) {
        console.error("❌ Error enviando chunk:", err);
      }
    }

    console.log("✅ Notificaciones enviadas correctamente");
    return res.json({
      success: true,
      tickets,
      message: `Intentadas ${messages.length} notificaciones`,
    });
  } catch (err) {
    console.error("❌ Error general enviando notificación:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
