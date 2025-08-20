const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['new-listing', 'price-drop', 'safety-alert'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House' }, // optional
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
