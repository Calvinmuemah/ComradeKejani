const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');

// Protect these routes with auth middleware if needed
router.post('/addLandlord', landlordController.createLandlord);
router.get('/Landlords', landlordController.getAllLandlords);
router.get('/:id', landlordController.getLandlordById);
router.put('/:id', landlordController.updateLandlord);
router.delete('/:id', landlordController.deleteLandlord);

module.exports = router;
