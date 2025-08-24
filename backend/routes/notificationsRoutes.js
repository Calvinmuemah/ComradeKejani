const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationsController');
const auth = require('../middlewares/authToken');

// Admin creates notification
router.post('/create', auth, notificationController.createNotification);

// Users fetch notifications (public)
router.get('/getAll', notificationController.getNotifications);

// Admin updates a notification by ID
router.put('/updateNotification/:id', auth, notificationController.updateNotification);

// Admin deletes a notification by ID
router.delete('/deleteNotification/:id', auth, notificationController.deleteNotification);

module.exports = router;

// Notifications Endpoints
// POST create a notification ==== /api/v1/notifications/create (admin only)
// GET all notifications ==== /api/v1/notifications/getAll (public)
// PUT a notification by ID ==== /api/v1/notifications/updateNotification/:id (admin only)
// DELETE a notification by ID ==== /api/v1/notifications/deleteNotification/:id (admin only)
