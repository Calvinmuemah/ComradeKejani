const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');

// Admin creates notification
router.post('/create', notificationController.createNotification);

// Users fetch notifications
router.get('/getAll', notificationController.getNotifications);

module.exports = router;

// notifications
// /api/v1/notifications/create
// /api/v1/notifications/getAll