const mongoose = require('mongoose');

const houseViewSchema = new mongoose.Schema({
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  count: { type: Number, default: 0 },
  lastViewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('HouseView', houseViewSchema);
