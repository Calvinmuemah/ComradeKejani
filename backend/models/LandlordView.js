const mongoose = require('mongoose');

const landlordViewSchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, default: 0 },
  lastViewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LandlordView', landlordViewSchema);
