const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    },
    source: { 
        type: String, 
        enum: ['WEB_FORM', 'SURVEY', 'PARTNER'], 
        default: 'WEB_FORM' 
    },
    deviceId: { type: String },
    moderatedBy: { type: String },
    moderatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
