const express = require("express");
const router = express.Router();
const Theme = require("../models/Theme");
// TODO: protege con tu middleware de admin:
const requireAdmin = (req,res,next)=>{ /* tu auth */ next(); };

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
