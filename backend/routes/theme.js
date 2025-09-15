// backend/routes/theme.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Theme = require('../models/Theme');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// ✅ GUARDA EN /backend/uploads/theme (sirve Express en /uploads)
const uploadDir = path.join(__dirname, '..', 'uploads', 'theme');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // ⬆️ 6MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Formato no permitido. Usa PNG/JPG/WebP/GIF/SVG'));
  }
});

// ⬆️ subir fondo login (desktop|mobile)
router.post(
  '/admin/theme/upload-login-bg',
  authMiddleware,
  authorize('admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/theme/${req.file.filename}`;
    return res.json({ url });
  }
);

// Guardar tema (upsert)
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

// Obtener tema (público)
router.get('/admin/theme', async (_req, res) => {
  try {
    const last = await Theme.findOne().sort({ createdAt: -1 }).lean();
    res.json(last || {});
  } catch (err) {
    console.error('Error reading theme:', err);
    res.status(500).json({ error: 'Error leyendo el tema' });
  }
});

// Manejo de errores de multer (tamaño, formato, etc)
router.use((err, _req, res, _next) => {
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'La imagen supera 6MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  res.status(500).json({ error: 'Error desconocido' });
});

// === Biblioteca de imágenes (admin) ===
router.get(
  '/admin/theme/login-bg-library',
  authMiddleware,
  authorize('admin'),
  async (req, res) => {
    try {
      const dir = path.join(__dirname, '..', 'uploads', 'theme');
      fs.mkdirSync(dir, { recursive: true });

      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      const files = entries.filter(e => e.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(e.name));

      const stats = await Promise.all(
        files.map(async f => {
          const full = path.join(dir, f.name);
          const st = await fs.promises.stat(full);
          return { name: f.name, size: st.size, mtime: st.mtimeMs };
        })
      );

      const origin = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const list = stats
        .sort((a, b) => b.mtime - a.mtime)
        .map(x => ({
          url: `${origin}/uploads/theme/${encodeURIComponent(x.name)}`,
          name: x.name,
          size: x.size,
          mtime: x.mtime,
        }));

      res.json(list);
    } catch (err) {
      console.error('GET /admin/theme/login-bg-library error:', err);
      res.status(500).json({ error: 'No se pudo leer la biblioteca' });
    }
  }
);


module.exports = router;
