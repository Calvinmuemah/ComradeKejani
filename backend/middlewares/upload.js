const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeName = baseName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;