const mongoose = require('mongoose');
const Notification = require('../models/notifications')

exports.createNotification = async (req, res) => {
    try {
        const { type, title, message, houseId } = req.body;

        const notification = new Notification({
            type,
            title,
            message,
            houseId
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 }) // newest first
            .populate('houseId', 'title price type'); // optional: show related house info

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
