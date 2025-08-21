const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');

// Admin creates notification
router.post('/create', notificationController.createNotification);
// Users fetch notifications
router.get('/getAll', notificationController.getNotifications);
// Update a notification by ID
router.put('/updateNotification/:id', notificationController.updateNotification);
// Delete a notification by ID
router.delete('/deleteNotification/:id', notificationController.deleteNotification);

module.exports = router;

// notifications
// /api/v1/notifications/create
// /api/v1/notifications/getAll
// PUT a notification by ID ====/api/v1/notifications/updateNotification/:id
// DELETE a notification by ID ====/api/v1/notifications/deleteNotification/:id
