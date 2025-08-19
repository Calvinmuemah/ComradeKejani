const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Landlord', landlordSchema);
