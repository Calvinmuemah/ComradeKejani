const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewController');
const reviewController = require('../controllers/aiRecomendations');
const reviews = require('../models/reviews');

// Create a review
router.post('/create', reviewsController.createReview);
// Get all reviews for a house
router.get('/house/:houseId', reviewsController.getReviewsByHouse);
// Update a review
router.put('/review/:reviewId', reviewsController.updateReview);
// Delete a review
router.delete('/review/:reviewId', reviewsController.deleteReview);
// Get the 5 most recent reviews across all houses
router.get('/recent', reviewsController.getRecentReviews);
// ai recomendations based on the houses with the most reviews
router.get('/top', reviewController.getTopReviewedHouses);

module.exports = router;


// reviews
// /api/v1/reviews/create
// /api/v1/reviews/house/:houseId
// /api/v1/reviews/review/:reviewId
// /api/v1/reviews/review/:reviewId
// /api/v1/reviews/recent
// api/v1/reviews/top