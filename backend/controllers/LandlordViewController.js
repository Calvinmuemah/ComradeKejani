const LandlordView = require('../models/LandlordView');

// Increment view count for a landlord
exports.incrementLandlordView = async (req, res) => {
  try {
    const { landlordId } = req.body;
    if (!landlordId) return res.status(400).json({ error: 'landlordId is required.' });

    const view = await LandlordView.findOneAndUpdate(
      { landlordId },
      { $inc: { count: 1 }, $set: { lastViewedAt: new Date() } },
      { new: true, upsert: true }
    );

    res.status(200).json(view);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get total views for a specific landlord
exports.getLandlordViews = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const view = await LandlordView.findOne({ landlordId }).lean();
    res.status(200).json({ landlordId, totalViews: view ? view.count : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get total views across all landlords
exports.getAllLandlordViews = async (req, res) => {
  try {
    const views = await LandlordView.find().lean();
    const totalViews = views.reduce((acc, v) => acc + (v.count || 0), 0);
    res.status(200).json({ totalViews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
