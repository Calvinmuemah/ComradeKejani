const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/reportIssueController');

router.post('/create', safetyController.createSafetyIssue);
router.get('/getAll', safetyController.getSafetyIssues);

module.exports = router;

// report issues
// POST create a report ====api/v1/reports/create
// GET all report issues ====api/v1/reports/getAll
