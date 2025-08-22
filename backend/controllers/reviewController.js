const Review = require('../models/reviews');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { houseId, userName, rating, comment } = req.body;
        const review = new Review({ houseId, userName, rating, comment });
        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all reviews for a house
exports.getReviewsByHouse = async (req, res) => {
    try {
        const { houseId } = req.params;
        const reviews = await Review.find({ houseId }).sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { rating, comment },
            { new: true }
        );
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get the 5 most recent reviews across all houses
exports.getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 }) // sort by newest first
            // .limit(5);               // limit to 5 results
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

