const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');
const auth = require('../middlewares/authToken');

// Admin routes (protected)
router.post('/addLandlord', auth, landlordController.createLandlord);
router.put('/Landlord/:id', auth, landlordController.updateLandlord);
router.delete('/Landlords/:id', auth, landlordController.deleteLandlord);

// Public routes (optional, e.g., viewing landlords)
router.get('/Landlords', landlordController.getAllLandlords);
router.get('/Landlord/:id', landlordController.getLandlordById);

module.exports = router;

// landlord
// /api/v1/landlords/addLandlord
// /api/v1/landlords/Landlords
// /api/v1/landlords/Landlord/:id
// /api/v1/landlords/Landlord/:id
// /api/v1/landlords/Landlords/:id
