const express = require('express');
const router = express.Router();
const {
  incrementLandlordView,
  getLandlordViews,
  getAllLandlordViews
} = require('../controllers/LandlordViewController');

// POST: increment view count when user taps "View Landlord Details"
router.post('/increment-view', incrementLandlordView);

// GET: total views for a specific landlord
router.get('/:landlordId', getLandlordViews);

// GET: total views across all landlords
router.get('/', getAllLandlordViews);

module.exports = router;

// HouseView Endpoints
// POST post all HouseViews ==== /api/v1/house-views/increment-view
// body{
//     {
//   "houseId": "68ab10641d73ab395746daa0"
// }
// }
// GET all HouseViews of a house ==== /api/v1/house-views/:houseId
// GET all HouseViews across all houses ==== api/v1/house-views