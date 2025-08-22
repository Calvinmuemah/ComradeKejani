const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const Review = require('../models/reviews');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI recommendation function
async function recommendHouseAI(houseId, reviews) {
    try {
        const systemPrompt = `
You are a property recommendation AI. 
Based on the following reviews, recommend if this house is suitable for new users.
Answer ONLY "YES" if it is highly recommended, "NO" otherwise.
`;

        const reviewsText = reviews.map(r => `- ${r.comment}`).join('\n');
        const userPrompt = `House ID: ${houseId}\nReviews:\n${reviewsText}`;

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const responseText = result.response.text().trim();
        console.log("Gemini AI raw output:", responseText);

        return responseText.toUpperCase().startsWith("YES");
    } catch (err) {
        console.error("AI recommendation error:", err);
        return false; // fallback
    }
}

// Get house with the most reviews and AI recommendation
exports.getTopReviewedHouses = async (req, res) => {
    try {
        // Aggregate to find top 5 houses with most reviews
        const topHouses = await Review.aggregate([
            { $group: { _id: "$houseId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 } // change this to any number of top houses you want
        ]);

        if (!topHouses.length) return res.status(404).json({ error: "No reviews found." });

        const results = [];

        for (const house of topHouses) {
            const houseId = house._id;
            const reviews = await Review.find({ houseId }).sort({ createdAt: -1 });

            // AI recommendation per house
            const recommended = await recommendHouseAI(houseId, reviews);

            results.push({
                houseId,
                totalReviews: house.count,
                recommended,
                reviews
            });
        }

        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
