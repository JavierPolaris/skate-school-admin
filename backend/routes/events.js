const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('targetGroups', 'name');
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Obtener próximos eventos futuros)
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({ date: { $gte: today } })
      .sort({ date: 1 })
      .limit(5); // Devuelve las próximas 5 clases, ajustable

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las próximas clases' });
  }
});

// Crear un nuevo evento
router.post('/', async (req, res) => {
  const { name, subject, date, layout, imageUrl, bodyText, targetGroups, targetAll, published } = req.body;


  if (!subject) {
    return res.status(400).json({ error: 'El campo subject es obligatorio.' });
  }

  try {
    const newEvent = new Event({
      name,
      subject,
      date,
      layout,
      imageUrl,
      bodyText,
      targetGroups,
      targetAll,
      published,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});


// Actualizar un evento
router.put('/:id', async (req, res) => {
  const { name, date, layout, imageUrl, bodyText, targetGroups, targetAll, published } = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, layout, imageUrl, bodyText, targetGroups, targetAll, published, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// Eliminar un evento
router.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado', deletedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

router.post("/events", async (req, res) => {
  const { name, date, description, isPublished, tokens } = req.body;

  try {
    const newEvent = new Event({ name, date, description, isPublished });
    await newEvent.save();

    if (isPublished) {
      const message = {
        notification: {
          title: "Nuevo evento publicado",
          body: name,
        },
        tokens,
      };

      await admin.messaging().sendMulticast(message);
    }

    res.json(newEvent);
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ error: "Error al crear el evento" });
  }
});


// Enviar Evento por Email
router.post('/:id/send-email', async (req, res) => {
  try {
    console.log('💥 Llamada a la ruta /send-email');
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('Evento no encontrado');
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    let recipients = [];
    if (event.targetAll) {
      const students = await User.find({ role: 'student' });
      recipients = students.map(student => student.email);
    } else if (event.targetGroups.length) {
      const students = await User.find({ groupId: { $in: event.targetGroups }, role: 'student' });
      recipients = students.map(student => student.email);
    }

    console.log('Destinatarios:', recipients);


function generateEmailContent(event) {
  const logoUrl = "https://www.kedekids.com/wp-content/uploads/2020/09/cropped-LOGO-KEDEKIDS-e1601394191149-1-2048x676.png";

  const logo = `
    <tr>
      <td align="center" style="padding:20px 0;">
        <img src="${logoUrl}" alt="Logo Kedekids" style="max-width:150px;">
      </td>
    </tr>`;

  const image = event.imageUrl ? `
    <tr>
      <td align="center" style="padding:20px 0;">
        <img src="${event.imageUrl}" alt="Imagen Evento" style="max-width:100%; border-radius:8px;">
      </td>
    </tr>` : '';

  const header = `
    <tr>
      <td align="center" style="color:#ef3340; font-size:24px; font-weight:bold; padding:20px 0;">
        ${event.name}
      </td>
    </tr>`;

  const body = `
    <tr>
      <td align="center" style="color:#ffffff; font-size:16px; padding:10px 0;">
        ${event.bodyText}
      </td>
    </tr>`;

  const footer = `
    <tr>
      <td align="center" style="padding:20px 0; border-top:1px solid #ffffff;">
        <div style="font-size:14px; line-height:1.5; color:#ffffff;">
          📞 +34 684 01 35 47 | +34 695 59 53 51<br>
          📧 <a href="mailto:info@kedekids.com" style="color:#ffffff; text-decoration:none;">info@kedekids.com</a><br>
          📍 Skatepark Bola de Oro, Paseo Fuente de la Bicha 30, Granada 18008<br><br>
          <a href="https://www.instagram.com/kedekids.skateboarding/" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" alt="Instagram" style="margin:0 5px; filter: brightness(0) invert(1);">
          </a>
          <a href="https://www.youtube.com/@kedekidsskateboarding7287" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" alt="YouTube" style="margin:0 5px; filter: brightness(0) invert(1);">
          </a>
          <a href="https://wa.me/34695595351" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24" height="24" alt="WhatsApp" style="margin:0 5px; filter: brightness(0) invert(1);">
          </a>
        </div>
        <br><br>
        <div style="font-size:12px; color:#ccc;">
          <a href="#" style="color:#ccc; text-decoration:none;">Ver en navegador</a> | 
          <a href="#" style="color:#ccc; text-decoration:none;">Política de privacidad</a><br>
          © 2025 Kedekids. Todos los derechos reservados.
        </div>
      </td>
    </tr>`;

  // Aquí controlamos el layout
  let content = '';
  switch (event.layout) {
    case 'header-body-image':
      content = `${logo}${header}${body}${image}${footer}`;
      break;
    case 'image-header-body':
      content = `${logo}${image}${header}${body}${footer}`;
      break;
    case 'only-image':
      content = `${logo}${image}${footer}`;
      break;
    default:
      content = `${logo}${header}${body}${footer}`;
  }

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#7D4642; font-family:Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#7D4642; color:#ffffff; padding:20px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>`;
}




    // Enviar correo
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: recipients.join(', '),
      subject: event.subject,
      html: generateEmailContent(event),
    });

    event.emailSent = true;
    await event.save();

    res.json({ success: true, message: 'Correo enviado correctamente.' });

  } catch (err) {
    console.error('Error en la ruta /send-email:', err);
    res.status(500).json({ error: 'Error al enviar el correo.' });
  }
});


module.exports = router;
