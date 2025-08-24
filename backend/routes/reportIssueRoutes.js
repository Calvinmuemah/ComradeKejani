const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/reportIssueController');
const auth = require('../middlewares/authToken');

// Create a safety/report issue (public)
router.post('/create', safetyController.createSafetyIssue);

// Get all safety/report issues (admin only)
router.get('/getAll', auth, safetyController.getSafetyIssues);

module.exports = router;

// Report Issues Endpoints
// POST create a report ==== /api/v1/reports/create
// GET all report issues ==== /api/v1/reports/getAll (admin only)
