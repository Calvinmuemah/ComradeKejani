const express = require('express');
const router = express.Router();
const {
  incrementHouseView,
  getHouseViews,
  getAllHouseViews
} = require('../controllers/HouseViewController');

// ----------------------------------------------------------------
// POST: Increment view count for a specific house
// Frontend should call this when a user taps the "View More" button.
// Body should contain: { houseId: "<house_id_here>" }
// Example request body: { "houseId": "68ab10cf1d73ab395746daa4" }
// ----------------------------------------------------------------
router.post('/increment-view', incrementHouseView);

// ----------------------------------------------------------------
// GET: Get total views for a specific house
// Use this route to fetch how many times a house has been viewed.
// Example: /api/v1/house-views/68ab10cf1d73ab395746daa4
// ----------------------------------------------------------------
router.get('/:houseId', getHouseViews);

// ----------------------------------------------------------------
// GET: Get total views for all houses
// Use this route to fetch view counts for all houses at once.
// Example: /api/v1/house-views
// ----------------------------------------------------------------
router.get('/', getAllHouseViews);

module.exports = router;

// HouseView Endpoints
// POST post all LandlordViews ==== /api/v1/landlord-views/increment-view
// body{
//     {
//   "landlordId": "68a8742ebc706ef2bb00f2cd"
// }

// }
// GET all LandlordViews ==== /api/v1/landlord-views/:landlordId
