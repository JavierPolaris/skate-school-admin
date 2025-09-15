// backend/routes/theme.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const Theme   = require('../models/Theme');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// === Storage para imágenes del login ===
const uploadDir = path.join(__dirname, '..', 'uploads', 'theme');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// === Subida de background de login (desktop/mobile) ===
router.post(
  '/admin/theme/upload-login-bg',
  authMiddleware,
  authorize('admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    // Puedes devolver relativa o absoluta. Relativa suele bastar para el front:
    const url = `/uploads/theme/${req.file.filename}`;
    // const url = `${req.protocol}://${req.get('host')}/uploads/theme/${req.file.filename}`; // absoluta

    res.json({ url });
  }
);

// === Guardar tema ===
router.put('/admin/theme', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const payload = req.body || {};
    let doc = await Theme.findOne().sort({ createdAt: -1 });

    if (!doc) {
      doc = await Theme.create(payload);
      return res.json(doc);
    }

    Object.assign(doc, payload);
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error('Error saving theme:', err);
    res.status(500).json({ error: 'No se pudo guardar el tema' });
  }
});

// === Obtener tema (público) ===
router.get('/admin/theme', async (_req, res) => {
  try {
    const last = await Theme.findOne().sort({ createdAt: -1 }).lean();
    res.json(last || {});
  } catch (err) {
    res.status(500).json({ error: 'Error leyendo el tema' });
  }
});

module.exports = router;
