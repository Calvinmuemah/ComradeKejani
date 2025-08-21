const express = require('express');
const router = express.Router();
const houseController = require('../controllers/houseController');
const upload = require('../middlewares/upload');

// Create house with images
// router.post('/create', upload.array('pictures', 5), houseController.createHouse);
router.post('/create', upload.array('images', 5), houseController.createHouse);


// Read
router.get('/getAll', houseController.getAllHouses);
router.get('/house/:id', houseController.getHouseById);

// Update house (images optional)
// router.put('/house/:id', upload.array('pictures', 5), houseController.updateHouse);
router.put('/house/:id', upload.array('images', 5), houseController.updateHouse);

// Delete
router.delete('/house/:id', houseController.deleteHouse);

module.exports = router;

// house
// /api/v1/houses/create
// /api/v1/houses/getAll
// /api/v1/houses/house/:id
// /api/v1/houses/house/:id
// /api/v1/houses/house/:id