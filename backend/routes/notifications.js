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

// Enviar notificación push
router.post("/send-notification", async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).send({ success: false, message: 'Tokens must be a non-empty array' });
  }

   const message = {
    notification: {
      title: title,
      body: body
    },
    tokens: tokens
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.status(200).send({
      success: true,
      message: 'Notification sent successfully',
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.responses.filter(r => !r.success).map(r => r.error)
    });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error sending notification', error });
  }
});

module.exports = router;