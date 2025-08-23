const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'houses',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Create house with images
router.post('/create', upload.array('images', 5), houseController.createHouse);

// Read
router.get('/getAll', houseController.getAllHouses);
router.get('/house/:id', houseController.getHouseById);

// Update house (images optional)
router.put('/house/:id', upload.array('images', 5), houseController.updateHouse);

// Delete
router.delete('/house/:id', houseController.deleteHouse);

module.exports = router;
