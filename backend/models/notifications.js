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
    startAt: { type: Date, default: Date.now }, // when alert becomes active
    endAt: { type: Date }, // when alert should end (optional)
    // TTL auto delete uses expireAt field; MongoDB drops doc automatically at this datetime
    expireAt: { type: Date, index: { expireAfterSeconds: 0 } },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
