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
            // .limit(5);               // limit to 5 results - commented out to get all reviews
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all reviews for admin dashboard with status information
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('houseId', 'title')  // Get the house title
            .sort({ createdAt: -1 });      // Sort by newest first
        
        // Transform the data to match the frontend expectations
        const formattedReviews = reviews.map(review => ({
            id: review._id,
            listingId: review.houseId._id,
            listingTitle: review.houseId.title || 'Unknown Property',
            rating: review.rating,
            text: review.comment,
            tags: extractTags(review.comment),
            source: 'WEB_FORM', // Default source
            deviceId: 'web_' + review._id.toString().substring(0, 6),
            status: review.status || 'PENDING', // Default to pending if not set
            createdAt: review.createdAt,
            moderatedBy: review.moderatedBy,
            moderatedAt: review.moderatedAt
        }));
        
        res.status(200).json(formattedReviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Approve a review
exports.approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { 
                status: 'APPROVED',
                moderatedBy: req.user?.name || 'Admin',
                moderatedAt: new Date()
            },
            { new: true }
        );
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject a review
exports.rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { 
                status: 'REJECTED',
                moderatedBy: req.user?.name || 'Admin',
                moderatedAt: new Date()
            },
            { new: true }
        );
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper function to extract tags from review text
function extractTags(text) {
    if (!text) return [];
    
    // Example logic to extract common themes as tags
    const tags = [];
    const lowerText = text.toLowerCase();
    
    // Check for common positive keywords
    if (lowerText.includes('clean') || lowerText.includes('tidy')) tags.push('clean');
    if (lowerText.includes('responsive') || lowerText.includes('quick')) tags.push('responsive landlord');
    if (lowerText.includes('location') || lowerText.includes('convenient')) tags.push('good location');
    
    // Check for common negative keywords
    if (lowerText.includes('water') && (lowerText.includes('issue') || lowerText.includes('problem'))) 
        tags.push('water issues');
    if (lowerText.includes('wifi') && (lowerText.includes('slow') || lowerText.includes('poor'))) 
        tags.push('slow wifi');
    if (lowerText.includes('unresponsive') || lowerText.includes('slow to respond')) 
        tags.push('unresponsive landlord');
    
    return tags;
}
