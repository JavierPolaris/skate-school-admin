const express = require("express");
const router = express.Router();
const Theme = require("../models/Theme");
// TODO: protege con tu middleware de admin:
const requireAdmin = (req,res,next)=>{ /* tu auth */ next(); };

const multer = require('multer');
const path = require('path');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'theme')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_')),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// POST /admin/theme/upload-login-bg?target=desktop|mobile
router.post('/admin/theme/upload-login-bg', authMiddleware, authorize('admin'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `${process.env.PUBLIC_BASE_URL || ''}/uploads/theme/${req.file.filename}`;
    res.json({ url });
  }
);

// GET actual
router.get("/admin/theme", async (req, res) => {
  const last = await Theme.findOne().sort({ createdAt: -1 }).lean();
  res.json(last || {});
});

// PUT actualiza (upsert “single doc”)
router.put("/admin/theme", requireAdmin, async (req, res) => {
  const payload = req.body || {};
  const last = await Theme.findOne().sort({ createdAt: -1 });
  if (!last) {
    const created = await Theme.create(payload);
    return res.json(created);
  }
  Object.assign(last, payload);
  await last.save();
  res.json(last);
});

module.exports = router;
