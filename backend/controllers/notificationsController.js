const mongoose = require('mongoose');
const Notification = require('../models/notifications')

exports.createNotification = async (req, res) => {
    try {
        const { type, title, message, houseId, startAt, endAt } = req.body;

        const notificationData = { type, title, message };
        if (houseId) notificationData.houseId = houseId;
        if (startAt) notificationData.startAt = new Date(startAt);
        if (endAt) {
            const end = new Date(endAt);
            notificationData.endAt = end;
            notificationData.expireAt = end; // set TTL auto-delete
        }

        const notification = new Notification(notificationData);

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
// Update a notification by ID
exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params; // notification ID from URL
        const { type, title, message, houseId, startAt, endAt } = req.body;
        const update = {};
        if (type) update.type = type;
        if (title) update.title = title;
        if (message) update.message = message;
        if (houseId !== undefined) update.houseId = houseId;
        if (startAt) update.startAt = new Date(startAt);
        if (endAt !== undefined) {
            if (endAt) {
                const end = new Date(endAt);
                update.endAt = end;
                update.expireAt = end;
            } else {
                update.endAt = undefined;
                update.expireAt = undefined;
            }
        }

        const updatedNotification = await Notification.findByIdAndUpdate(id, update, { new: true, runValidators: true });

        if (!updatedNotification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.status(200).json(updatedNotification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params; // notification ID from URL

        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

