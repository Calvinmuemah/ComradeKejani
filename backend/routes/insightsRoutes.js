const express = require('express');
const router = express.Router();
const {
  getPriceTrends,
  getPopularEstates
} = require('../controllers/insightsController');

// GET: price trends over time
router.get('/price-trends', getPriceTrends);

// GET: estates with highest views
router.get('/popular-estates', getPopularEstates);

module.exports = router;
