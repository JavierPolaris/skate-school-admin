const express = require('express');
const router = express.Router();
const Trick = require('../models/Trick');

// Obtener todos los trucos
router.get('/', async (req, res) => {
  try {
    const tricks = await Trick.find();
    res.json(tricks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener trucos' });
  }
});

// Crear un nuevo truco
router.post('/', async (req, res) => {
  try {
    const newTrick = new Trick(req.body);
    const savedTrick = await newTrick.save();
    res.status(201).json(savedTrick);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear truco' });
  }
});

// Actualizar un truco
router.put('/:id', async (req, res) => {
  try {
    const updatedTrick = await Trick.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTrick);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar truco' });
  }
});

// Eliminar un truco
router.delete('/:id', async (req, res) => {
  try {
    await Trick.findByIdAndDelete(req.params.id);
    res.json({ message: 'Truco eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar truco' });
  }
});

// Marcar truco como realizado por un alumno (evitar duplicados)
router.post('/mark-done', async (req, res) => {
  const { userId, trickId } = req.body;

  try {
    const trick = await Trick.findById(trickId);
    if (!trick) return res.status(404).json({ error: 'Truco no encontrado' });

    // Si no existe el campo doneBy, lo inicializamos
    if (!trick.doneBy) trick.doneBy = [];

    // Evitar que el mismo alumno marque varias veces
    if (!trick.doneBy.includes(userId)) {
      trick.doneBy.push(userId);
      trick.completed = trick.doneBy.length; // Actualizamos contador
      await trick.save();
    }

    res.json({ message: 'Truco marcado como realizado correctamente.' });
  } catch (error) {
    console.error('Error al marcar como realizado:', error);
    res.status(500).json({ error: 'Error al marcar como realizado.' });
  }
});


// Registrar un "like" a un truco
router.post('/like', async (req, res) => {
  const { trickId, userId } = req.body;

  try {
    const trick = await Trick.findById(trickId);
    if (!trick) return res.status(404).json({ error: 'Truco no encontrado' });

    if (!trick.likedBy.includes(userId)) {
      trick.likes += 1;
      trick.likedBy.push(userId);
      await trick.save();
    }

    res.json({ message: 'Like registrado', trick });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar like' });
  }
});



// Registrar una vista de video
router.post('/view', async (req, res) => {
  const { trickId } = req.body;

  try {
    const trick = await Trick.findById(trickId);
    if (!trick) return res.status(404).json({ error: 'Truco no encontrado' });

    trick.views += 1;
    await trick.save();

    // Devuelve el truco actualizado
    res.json({ message: 'Vista registrada', trick });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar vista' });
  }
});


// Actualizar solo el campo highlighted
router.put('/highlight/:id', async (req, res) => {
  try {
    const { highlighted } = req.body;
    const updatedTrick = await Trick.findByIdAndUpdate(
      req.params.id,
      { highlighted },
      { new: true }
    );
    res.json(updatedTrick);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar destacado' });
  }
});

// Videos vistos para Dashboard
router.get('/total-views', async (req, res) => {
  try {
    const tricks = await Trick.find();
    const totalViews = tricks.reduce((sum, trick) => sum + (trick.views || 0), 0);
    res.json({ totalViews });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visualizaciones totales' });
  }
});

// Obtener truco más visto
router.get('/most-viewed', async (req, res) => {
  try {
    const mostViewedTrick = await Trick.findOne().sort({ views: -1 }).limit(1);
    res.json(mostViewedTrick);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el truco más visto' });
  }
});



module.exports = router;
