const express = require("express");
const router = express.Router();
const messaging = require("../firebase"); // ahora es getMessaging()
const Group = require("../models/Group");
const User = require("../models/User");

// Obtener notificaciones de un grupo
router.get("/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    res.json(group.notifications || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener notificaciones del grupo" });
  }
});

// Guardar token de dispositivo
router.put("/save-device-token", async (req, res) => {
  console.log("Body recibido:", req.body);
  const { email, deviceToken } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { deviceToken },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Token guardado con éxito", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el token" });
  }
});

// Enviar notificación push a todos los miembros de un grupo (FCM v1)
router.post("/send-notification/:groupId", async (req, res) => {
  const { title, body } = req.body;
  const { groupId } = req.params;

  try {
    console.log(`Iniciando envío al grupo ${groupId}: ${title}`);
    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      return res.status(404).json({ error: "Grupo no encontrado" });
    }

    // Extrae los deviceTokens FCM
    const tokens = group.members
      .map((m) => m.deviceToken)
      .filter((t) => !!t);

    if (tokens.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No hay tokens FCM" });
    }

    // Construye el payload multicast
    const message = {
      notification: { title, body },
      tokens,                      // array de tokens nativos FCM
      data: { groupId },
      android: { notification: { sound: "default" } },
    };

    // Envía
    const response = await messaging.sendMulticast(message);
    console.log("✅ FCM respuesta:", response);

    return res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      responses: response.responses,
    });
  } catch (err) {
    console.error("❌ Error enviando FCM:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
