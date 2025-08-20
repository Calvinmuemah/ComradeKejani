const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    address: { type: String, required: true },
    type: { type: String, required: true },
    rooms: { type: Number, required: true },
    rent: { type: Number, required: true },
    status: { type: String, default: 'available' },
    security: { type: Boolean, default: false },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
    pictures: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('House', houseSchema);
