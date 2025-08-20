const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    verified: { type: Boolean, default: false }, // new field
    rating: { type: Number, default: 0 },        // new field, optional
}, { timestamps: true });

module.exports = mongoose.model('Landlord', landlordSchema);
