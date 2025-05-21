const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configuración de multer para almacenar archivos en una carpeta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });


// Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('members');
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
});

// Obtener próximas clases del grupo asignado
router.get('/upcoming-classes/:groupId', async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const today = new Date();
const twoWeeksLater = new Date();
twoWeeksLater.setDate(today.getDate() + 14);

const upcomingClasses = group.scheduledDates
  .filter(({ date }) => {
    const classDate = new Date(date);
    return classDate >= today && classDate <= twoWeeksLater;
  })
 .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5) // Máximo 5 clases, opcional
     .map(({ date, startTime, endTime, place }) => ({
  date,
  startTime,
  endTime,
  place: (place !== undefined && place !== null && place.trim() !== '') ? place : 'Skate park Bola de Oro',
}));


res.json(upcomingClasses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las próximas clases del grupo' });
  }
});


// Crear un grupo
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newGroup = new Group({ name });
    await newGroup.save();
    res.json(newGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
});

// Obtener un grupo por ID y poblar sus miembros
router.get('/:id', async (req, res) => {
    try {
      const group = await Group.findById(req.params.id).populate('members');
      if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
      res.json(group);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener el grupo' });
    }
  });

// Actualizar un grupo
router.put('/:id', async (req, res) => {
    const { name, scheduledDates, ranking, previousRanking, tricks  } = req.body;
    let updateFields = {};
    if (name) updateFields.name = name;
    if (scheduledDates) {
  updateFields.scheduledDates = scheduledDates.map(d => ({
    date: d.date,
    startTime: d.startTime,
    endTime: d.endTime,
    place: d.place || 'Skate park Bola de Oro', // Predefinido si no se indica
  }));
}
    if (ranking !== undefined) updateFields.ranking = ranking;
    if (previousRanking !== undefined) updateFields.previousRanking = previousRanking;
    if (tricks !== undefined) updateFields.tricks = tricks;

    try {
      const updatedGroup = await Group.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true }
      ).populate('members');
      if (!updatedGroup) return res.status(404).json({ error: 'Grupo no encontrado' });
      res.json(updatedGroup);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar el grupo' });
    }
  });
  

// Eliminar un grupo
router.delete('/:id', async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ message: 'Grupo eliminado', group: deletedGroup });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el grupo' });
  }
});


// Agregar miembro al grupo
router.put('/:id/addMember', async (req, res) => {
  try {
    const { userId } = req.body;

    // Agregar el usuario al grupo
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } }, // Evita duplicados
      { new: true }
    ).populate('members');

    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    // Actualizar el campo groupId del usuario
    await User.findByIdAndUpdate(userId, { groupId: req.params.id });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar miembro' });
  }
});

// Eliminar miembro del grupo
router.put('/:id/removeMember', async (req, res) => {
  try {
    const { userId } = req.body;

    // Eliminar el usuario del grupo
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userId } }, // Elimina el userId de los miembros
      { new: true }
    ).populate('members');

    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    // Limpiar el campo groupId del usuario
    await User.findByIdAndUpdate(userId, { $unset: { groupId: "" } });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar miembro' });
  }
});

  
  // POST /api/groups/:id/notifications
router.post('/:id/notifications', async (req, res) => {
    try {
      const { message } = req.body;
      const group = await Group.findById(req.params.id);
      if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  
      group.notifications.push({ message });
      await group.save();
      // Opcional: populate members si necesitas
      res.json(group);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al agregar notificación' });
    }
  });
  

module.exports = router;


// Ruta para actualizar el avatar del grupo
router.put('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    // Aquí puedes, si lo deseas, subir el archivo a un servicio en la nube.
    // En este ejemplo, usamos la URL local:
    const avatarUrl = `${API_URL}/uploads/${req.file.filename}`;

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true }
    ).populate('members');

    if (!updatedGroup) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(updatedGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el avatar' });
  }
});
