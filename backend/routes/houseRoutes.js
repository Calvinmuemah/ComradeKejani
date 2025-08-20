const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const upload = require('../middlewares/upload');

// Create house with images
router.post('/create', upload.array('pictures', 5), houseController.createHouse);

// Read
router.get('/getAll', houseController.getAllHouses);
router.get('/:id', houseController.getHouseById);

// Update house (images optional)
router.put('/:id', upload.array('pictures', 5), houseController.updateHouse);

// Delete
router.delete('/:id', houseController.deleteHouse);

module.exports = router;
