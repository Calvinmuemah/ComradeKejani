const mongoose = require('mongoose');

const safetyIssueSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['safety', 'complaint', 'other'], default: 'safety' },
    verified: { type: Boolean, default: false }, // will be set after AI verification
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SafetyIssue', safetyIssueSchema);
