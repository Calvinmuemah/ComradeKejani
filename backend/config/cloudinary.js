const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
cloudinary.api
  .ping()
  .then(() => console.log('Connected to Cloudinary successfully'))
  .catch((err) => console.error('Cloudinary connection error:', err));

module.exports = cloudinary;
