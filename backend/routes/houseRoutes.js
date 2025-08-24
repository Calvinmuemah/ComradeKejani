const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/authToken');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'houses',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Admin routes (protected)
router.post('/create', auth, upload.array('images', 5), houseController.createHouse);
router.put('/house/:id', auth, upload.array('images', 5), houseController.updateHouse);
router.delete('/house/:id', auth, houseController.deleteHouse);

// Public routes
router.get('/getAll', houseController.getAllHouses);
router.get('/house/:id', houseController.getHouseById);

module.exports = router;

// house
// /api/v1/houses/create
// /api/v1/houses/getAll
// /api/v1/houses/house/:id
// /api/v1/houses/house/:id
// /api/v1/houses/house/:id
