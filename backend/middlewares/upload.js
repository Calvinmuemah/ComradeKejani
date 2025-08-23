const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'houses', // folder name in Cloudinary
    format: 'jpg',    // convert to jpg
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // unique name
    transformation: [
      { width: 800, height: 600, crop: 'limit' } // resize to 800x600
    ]
  }),
});

const upload = multer({ storage });

module.exports = upload;
