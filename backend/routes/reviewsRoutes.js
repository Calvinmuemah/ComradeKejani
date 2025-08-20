const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewController');
const reviews = require('../models/reviews');

// Create a review
router.post('/create', reviewsController.createReview);
// Get all reviews for a house
router.get('/house/:houseId', reviewsController.getReviewsByHouse);
// Update a review
router.put('/review/:reviewId', reviewsController.updateReview);
// Delete a review
router.delete('/review/:reviewId', reviewsController.deleteReview);

module.exports = router;


// reviews
// /api/v1/reviews/create
// /api/v1/reviews/house/:houseId
// /api/v1/reviews/review/:reviewId
// /api/v1/reviews/review/:reviewId