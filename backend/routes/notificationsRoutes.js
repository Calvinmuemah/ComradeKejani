const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');

// Admin creates notification
router.post('/create', notificationController.createNotification);

// Users fetch notifications
router.get('/getAll', notificationController.getNotifications);

module.exports = router;
