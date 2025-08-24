const HouseView = require('../models/HouseView');
const House = require('../models/House');

// Increment view count when user taps "view more"
exports.incrementHouseView = async (req, res) => {
  try {
    const { houseId } = req.body;

    if (!houseId) {
      return res.status(400).json({ error: "houseId is required" });
    }

    // Check if house exists
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    // Increment view count
    const updatedView = await HouseView.findOneAndUpdate(
      { houseId },
      { $inc: { count: 1 }, $set: { lastViewedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "View count incremented", view: updatedView });
  } catch (err) {
    console.error("Error incrementing house view:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get total views for a single house
exports.getHouseViews = async (req, res) => {
  try {
    const { houseId } = req.params;

    const houseView = await HouseView.findOne({ houseId }).lean();

    if (!houseView) {
      return res.status(404).json({ error: "No views found for this house." });
    }

    res.status(200).json({ houseId, totalViews: houseView.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getAllHouseViews = async (req, res) => {
  try {
    const views = await HouseView.find().lean();

    // Sum up all counts
    const totalViews = views.reduce((sum, v) => sum + (v.count || 0), 0);

    res.status(200).json({ totalViews }); // returns: { totalViews: 11 } for your example
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

