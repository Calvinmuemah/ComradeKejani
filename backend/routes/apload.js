const express = require('express');
const upload = require('../middlewares/upload');

const router = express.Router();

// POST /api/upload/image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;