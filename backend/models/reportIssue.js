const mongoose = require('mongoose');

const safetyIssueSchema = new mongoose.Schema({
    description: { type: String, required: true },
    type: { type: String, enum: ['Safety', 'Complaint', 'Other', 'Maintenance'], default: 'safety' },
    verified: { type: Boolean, default: false }, // will be set after AI verification
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SafetyIssue', safetyIssueSchema);
