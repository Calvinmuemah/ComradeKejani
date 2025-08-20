const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewController');

// Create a review
router.post('/create', reviewsController.createReview);
// Get all reviews for a house
router.get('/house/:houseId', reviewsController.getReviewsByHouse);
// Update a review
router.put('/:reviewId', reviewsController.updateReview);
// Delete a review
router.delete('/:reviewId', reviewsController.deleteReview);

module.exports = router;
