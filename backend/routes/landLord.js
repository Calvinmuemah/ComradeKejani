const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');

// Protect these routes with auth middleware if needed
router.post('/addLandlord', landlordController.createLandlord);
router.get('/Landlords', landlordController.getAllLandlords);
router.get('/Landlord/:id', landlordController.getLandlordById);
router.put('/Landlord/:id', landlordController.updateLandlord);
router.delete('/Landlords/:id', landlordController.deleteLandlord);

module.exports = router;

// landlord
// /api/v1/landlords/addLandlord
// /api/v1/landlords/Landlords
// /api/v1/landlords/Landlord/:id
// /api/v1/landlords/Landlord/:id
// /api/v1/landlords/Landlords/:id