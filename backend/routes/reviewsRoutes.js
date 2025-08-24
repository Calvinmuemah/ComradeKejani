const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewController');
const reviewController = require('../controllers/aiRecomendations');
const auth = require('../middlewares/authToken');

// Create a review (public)
router.post('/create', reviewsController.createReview);

// Get all reviews for a house (public)
router.get('/house/:houseId', reviewsController.getReviewsByHouse);

// Update a review (admin only)
router.put('/review/:reviewId', auth, reviewsController.updateReview);

// Delete a review (admin only)
router.delete('/review/:reviewId', auth, reviewsController.deleteReview);

// Get the 5 most recent reviews across all houses (public)
router.get('/recent', reviewsController.getRecentReviews);

// AI recommendations based on houses with most reviews (public)
router.get('/top', reviewController.getRecentReviewedHouses);

module.exports = router;

// Reviews endpoints
// /api/v1/reviews/create
// /api/v1/reviews/house/:houseId
// /api/v1/reviews/review/:reviewId
// /api/v1/reviews/review/:reviewId
// /api/v1/reviews/recent
// /api/v1/reviews/top
