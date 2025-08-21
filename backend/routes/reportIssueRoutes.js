const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/reportIssueController');

router.post('/', safetyController.createSafetyIssue);
router.get('/', safetyController.getSafetyIssues);

module.exports = router;
