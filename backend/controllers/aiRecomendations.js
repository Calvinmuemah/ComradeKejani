const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const Review = require('../models/reviews');
const House = require('../models/House');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to generate AI recommendation for a house
async function generateAIRecommendation(house) {
  try {
    const nearby = house.location.nearbyEssentials
      .map(e => `${e.name} (${e.type}, ${e.distance}m away)`)
      .join(', ');

    const prompt = `
You are a friendly real estate assistant AI. 
Given the house details below, write a short, persuasive, and warm recommendation 
message encouraging a user to consider or love staying in this house. Highlight 
the house type, price, location, and nearby amenities. Avoid private info.

House title: ${house.title}
Price: KES ${house.price}
Type: ${house.type}
Location: ${house.location.estate}, ${house.location.address}
Distance from university: walking ${house.location.distanceFromUniversity.walking} min, boda ${house.location.distanceFromUniversity.boda} min, matatu ${house.location.distanceFromUniversity.matatu} min
Nearby essentials: ${nearby}
`;

    const result = await model.generateContent([prompt]);
    return result.response.text().trim();
  } catch (err) {
    console.error("AI recommendation error:", err);
    // Fallback message if quota is exceeded or API fails
    return `This house "${house.title}" is cozy, well-located, and worth considering!`;
  }
}

// Endpoint: get 5 most recent houses with AI recommendations
exports.getRecentReviewedHouses = async (req, res) => {
  try {
    // Step 1: Get 5 most recent reviews
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('houseId')
      .lean();

    if (!reviews.length) {
      return res.status(404).json({ error: "No recent reviews found." });
    }

    // Step 2: Deduplicate house IDs
    const uniqueHouseIds = [...new Set(reviews.map(r => r.houseId.toString()))];

    const results = [];

    for (const houseId of uniqueHouseIds) {
      const house = await House.findById(houseId)
        .select("title price type location images")
        .lean();

      if (!house) {
        console.log(`House not found for ID: ${houseId}`);
        continue;
      }

      // Step 3: Generate AI recommendation (with fallback)
      const aiRecommendation = await generateAIRecommendation(house);

      results.push({
        houseId,
        house,
        aiRecommendation
      });
    }

    res.status(200).json(results);

  } catch (err) {
    console.error("Error fetching recent reviewed houses:", err);
    res.status(500).json({ error: err.message });
  }
};
