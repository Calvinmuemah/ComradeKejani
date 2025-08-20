const express = require('express');
const router = express.Router();
const { register, login, googleLogin } = require('../controllers/users');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);

module.exports = router;

// admin auth
// /api/v1/admin/register
// /api/v1/admin/login
