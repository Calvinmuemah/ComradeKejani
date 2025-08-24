const House = require('../models/House');
const HouseView = require('../models/HouseView');

// GET /api/v1/insights/price-trends
exports.getPriceTrends = async (req, res) => {
  try {
    const trends = await House.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          averagePrice: { $avg: "$price" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const priceTrends = trends.map(t => ({
      month: t._id,
      averagePrice: Math.round(t.averagePrice)
    }));

    res.json({ priceTrends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/insights/popular-estates
exports.getPopularEstates = async (req, res) => {
  try {
    const views = await HouseView.aggregate([
      {
        $lookup: {
          from: "houses",
          localField: "houseId",
          foreignField: "_id",
          as: "house"
        }
      },
      { $unwind: "$house" },
      {
        $group: {
          _id: "$house.location.estate",
          totalViews: { $sum: "$count" },
          houseTypes: { $addToSet: "$house.type" }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    const popularEstates = views.map(v => ({
      estate: v._id,
      views: v.totalViews,
      houseTypes: v.houseTypes
    }));

    res.json({ popularEstates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
