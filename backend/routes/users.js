const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { authMiddleware, authorize } = require('../middleware/authMiddleware'); // Importa el middleware
const Group = require('../models/Group');
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PaymentHistory = require('../models/PaymentHistory');

// Login de administrador
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('groupId', 'name');
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    console.log('Contraseña introducida:', password);
    console.log('Contraseña almacenada (hash):', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña válida?', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'secretKey',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        groupId: user.groupId || null // ¡IMPORTANTE! 
      }
    });
  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Inicializar usuario administrador si no existe
router.post('/init-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: 'javierrojocanton@gmail.com' });
    if (adminExists) {
      return res.json({ message: 'El administrador ya existe.' });
    }

    const hashedPassword = await bcrypt.hash('Skatekids123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'javierrojocanton@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    res.json({ message: 'Administrador inicial creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el administrador inicial.' });
  }
});

// Enviar una solicitud de acceso
router.post('/request-access', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Verificar si ya existe una solicitud o usuario con el mismo email
    const existingRequest = await Request.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingRequest || existingUser) {
      return res.status(400).json({ error: 'Ya existe una solicitud o usuario con este email.' });
    }

    // Crear la solicitud
    const newRequest = new Request({ name, email });
    await newRequest.save();

    res.json({ message: 'Solicitud enviada con éxito.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar la solicitud.' });
  }
});

// Obtener todas las solicitudes (solo admin)
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las solicitudes.' });
  }
});

// Configuración de transporte para enviar correos
const transporter = nodemailer.createTransport({
  service: 'gmail', // Cambia esto según tu proveedor de correo
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Aprobar o rechazar solicitud y registrar usuario con rol elegido
router.put('/requests/:id', async (req, res) => {
  try {
    const { status, role } = req.body; // El rol se pasa desde el frontend al aprobar

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    if (status === 'approved') {
      const temporaryPassword = 'Alumno123'; // Cambiar a un generador si prefieres algo más seguro
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      console.log('Password temporal:', temporaryPassword);
      console.log('Password hashed:', hashedPassword);

      const newUser = new User({
        name: request.name,
        email: request.email,
        password: temporaryPassword,
        role: role || 'student', // Si no se especifica, asignamos 'student'
      });

      await newUser.save();

      // Enviar correo al usuario con las credenciales
      const mailOptions = {
        from: process.env.EMAIL,
        to: request.email,
        subject: 'Bienvenido a Skate School',
        text: `
Hola ${request.name},

Tu solicitud de acceso ha sido aprobada.

Puedes iniciar sesión con los siguientes datos:

Email: ${request.email}
Contraseña temporal: ${temporaryPassword}

Por favor, cambia tu contraseña tras iniciar sesión.

Saludos,
El equipo de Skate School
        `,
      };

      await transporter.sendMail(mailOptions);

      // Eliminar la solicitud de la base de datos
      await Request.findByIdAndDelete(req.params.id);

      return res.json({ message: 'Solicitud aprobada y usuario creado.' });
    }

    if (status === 'rejected') {
      await Request.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Solicitud rechazada y eliminada.' });
    }

    res.status(400).json({ error: 'Estado de solicitud no válido.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});



// Cambiar contraseña
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // El usuario autenticado ya está disponible en req.user
    const user = req.user;

    // Verificar la contraseña actual
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta.' });
    }

    user.password = newPassword;

    await user.save();

    res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});

// Obtener usuarios filtrados por role (ejemplo: /api/users?role=alumno)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;
    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario (POST /api/users)
router.post('/', async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    const newUser = new User({ name, email, role, phone });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});


// Obtener todos los alumnos
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('groupId', 'name'); // Filtramos solo los alumnos

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// Endpoint para registrar alumnos
router.post('/register-student', async (req, res) => {
  const { name, email, phone } = req.body; // No esperamos password ahora

  try {
    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con este email.' });
    }

    // Crear una contraseña temporal para el alumno
    const temporaryPassword = 'Skate1234!'; // Contraseña por defecto o generada aleatoriamente
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Crear el nuevo alumno
    const newStudent = new User({
      name,
      email,
      password: hashedPassword, // Guardamos la contraseña temporal
      phone, // Incluimos el teléfono
      role: 'student', // Asegurarse de que sea un alumno
    });

    await newStudent.save();

    // Enviar correo con la contraseña temporal
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Bienvenido a Skate School',
      text: `
        Hola ${name},

        Tu cuenta en Skate School ha sido creada exitosamente.

        Puedes iniciar sesión con las siguientes credenciales:
        Email: ${email}
        Contraseña: ${temporaryPassword}

        Te recomendamos cambiar tu contraseña al iniciar sesión.

        ¡Bienvenido a bordo!

        Saludos,
        Skate School Team
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Alumno registrado exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar al alumno.' });
  }
});


// Actualizar un alumno existente y registrar el pago en PaymentHistory
router.put('/students/:id', async (req, res) => {
  try {
    const { name, email, phone, groupId, paymentMethod, discount } = req.body;

    // Buscar el alumno actual
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }

    // Si el grupo cambia, actualizar en ambos modelos
    if (student.groupId && student.groupId.toString() !== groupId) {
      // Remover del grupo anterior
      await Group.findByIdAndUpdate(student.groupId, {
        $pull: { members: student._id },
      });
    }

    // Agregar al nuevo grupo si corresponde
    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        $addToSet: { members: student._id },
      });
    }

    // Actualizar los datos del alumno, incluyendo el método de pago
    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, groupId, paymentMethod, discount },
      { new: true }
    ).populate('groupId'); // Para devolver el grupo completo

    // Registrar el pago en PaymentHistory
    const paymentHistory = new PaymentHistory({
      userId: updatedStudent._id,
      method: paymentMethod,
      date: new Date(),
    });
    await paymentHistory.save(); // Guardamos el historial de pagos

    res.json(updatedStudent); // Retornamos el alumno actualizado
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el alumno y registrar el pago' });
  }
});

router.get('/payments-history', async (req, res) => {
  try {
    const payments = await PaymentHistory.find().populate('userId', 'name email');
    res.json(payments);
  } catch (err) {
    console.error('Error al obtener el historial de pagos:', err);
    res.status(500).json({ error: 'Error al obtener el historial de pagos' });
  }
});

router.get('/payments-history/:userId', async (req, res) => {
  try {
    const payments = await PaymentHistory.find({ userId: req.params.userId });
    res.json(payments);
  } catch (err) {
    console.error('Error al obtener pagos del usuario:', err);
    res.status(500).json({ error: 'Error al obtener pagos del usuario' });
  }
});

// Agregar miembro a un grupo
router.put('/:id/addMember', async (req, res) => {
  const { userId } = req.body;

  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } }, // Evita duplicados
      { new: true }
    ).populate('members');

    // Actualizar el `groupId` del alumno
    await User.findByIdAndUpdate(userId, { groupId: group._id });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar miembro.' });
  }
});

// Eliminar miembro de un grupo
router.put('/:id/removeMember', async (req, res) => {
  const { userId } = req.body;

  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userId } }, // Elimina el ID del miembro
      { new: true }
    ).populate('members');

    // Eliminar el `groupId` del alumno
    await User.findByIdAndUpdate(userId, { groupId: null });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar miembro.' });
  }
});


// Eliminar un alumno
router.delete('/students/:id', async (req, res) => {
  try {
    const deletedStudent = await User.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Alumno no encontrado.' });
    }
    res.json({ message: 'Alumno eliminado.', deletedStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el alumno.' });
  }
});

// routes/users.js
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
// enviar notificaciones
router.post('/send-notification', async (req, res) => {
  const { title, body, groupId } = req.body;

  try {
    // Obtener los tokens de los usuarios en el grupo
    const users = await User.find({ groupId });
    const tokens = users.map(user => user.deviceToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'No hay usuarios con tokens registrados.' });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    res.json({
      message: 'Notificación enviada con éxito',
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (err) {
    console.error('Error al enviar la notificación:', err);
    res.status(500).json({ error: 'Error al enviar la notificación' });
  }
});
// guardar el token en la base de datos
router.put('/device-token', async (req, res) => {
  const { email, deviceToken } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { deviceToken }, // Almacena el token en el campo deviceToken
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Token de dispositivo actualizado correctamente.' });
  } catch (err) {
    console.error('Error al actualizar el token:', err);
    res.status(500).json({ error: 'Error al actualizar el token.' });
  }
});

// Obtener los datos del usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('Usuario autenticado:', req.user);
    const user = await User.findById(req.user._id); // Cambiado a req.user._id
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = {
      name: user.name,
      avatar: user.avatar, // Devuelve el avatar si existe
    };

    console.log('Datos del usuario que se envían:', userData);

    res.json(userData);
  } catch (err) {
    console.error('Error al obtener los datos del usuario:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(avatarDir, { recursive: true }); // Crear la carpeta si no existe
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
// Subir avatar

router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const user = req.user;

    // Verificar si existe un avatar anterior y eliminarlo
    if (user.avatar) {
      const avatarPath = path.join(__dirname, `../uploads/avatars/${user.avatar}`);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      } else {
        console.warn(`El avatar anterior no existe en la ruta: ${avatarPath}`);
      }
    }

    // Guardar el nuevo avatar
    user.avatar = req.file.filename;
    await user.save();

    res.json({ message: 'Avatar actualizado con éxito', avatar: user.avatar });
  } catch (err) {
    console.error('Error al subir el avatar:', err);
    res.status(500).json({ error: 'Error al subir el avatar' });
  }
});

// Obtener avatar
router.get('/avatar/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, `../uploads/avatars/${filename}`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Avatar no encontrado' });
  }

  res.sendFile(filePath);
}
);

// Eliminar avatar
router.delete('/avatar', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (user.avatar) {
      const avatarPath = path.join(__dirname, `../uploads/avatars/${user.avatar}`);
      try {
        await fs.promises.access(avatarPath); // Verifica si el archivo existe
        await fs.promises.unlink(avatarPath); // Elimina el archivo
      } catch (err) {
        console.warn(`El avatar no existe en la ruta: ${avatarPath}`);
      }
    }

    res.json({ message: 'Avatar eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar el avatar:', err);
    res.status(500).json({ error: 'Error al eliminar el avatar' });
  }
});


// Search
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();

    // Buscar usuarios
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('name email _id'); // Selecciona solo campos relevantes

    // Buscar grupos
    const groups = await Group.find({
      name: { $regex: query, $options: 'i' },
    }).select('name _id');

    // Buscar eventos
    const events = await Event.find({
      name: { $regex: query, $options: 'i' },
    }).select('name _id');

    res.json({
      users: users.map(user => ({ ...user.toObject(), type: 'user' })),
      groups: groups.map(group => ({ ...group.toObject(), type: 'group' })),
      events: events.map(event => ({ ...event.toObject(), type: 'event' })),
    });
  } catch (err) {
    console.error('Error en la búsqueda:', err);
    res.status(500).json({ error: 'Error al realizar la búsqueda.' });
  }
});

// Dashboard para admin
router.get('/admin-dashboard', authMiddleware, authorize('admin'), (req, res) => {
  res.json({ message: 'Bienvenido Admin' });
});

// Dashboard para alumno
router.get('/student-dashboard', authMiddleware, authorize('student'), (req, res) => {
  res.json({ message: 'Bienvenido Alumno' });
});

module.exports = router;
