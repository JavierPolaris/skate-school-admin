const express = require("express");
const router = express.Router();
const Theme = require("../models/Theme");
// TODO: protege con tu middleware de admin:
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'theme')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_')),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

router.post(
  '/admin/theme/upload-login-bg',
  authMiddleware,
  authorize('admin'),
  upload.single('image'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/theme/${req.file.filename}`;
    return res.json({ url });
  }
);

// ✅ Guardar tema protegido (en vez de requireAdmin “dummy”)
router.put(
  '/admin/theme',
  authMiddleware,
  authorize('admin'),
  async (req, res) => {
    const payload = req.body || {};
    const last = await Theme.findOne().sort({ createdAt: -1 });
    if (!last) {
      const created = await Theme.create(payload);
      return res.json(created);
    }
    Object.assign(last, payload);
    await last.save();
    res.json(last);
  }
);

// GET puede quedarse público si quieres
router.get('/admin/theme', async (req, res) => {
  const last = await Theme.findOne().sort({ createdAt: -1 }).lean();
  res.json(last || {});
});

module.exports = { authMiddleware, authorize };
