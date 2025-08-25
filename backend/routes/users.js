const express = require('express');
const router = express.Router();
const { register, login, getUserDetails, updateUser, listAdmins } = require('../controllers/users');

router.get('/', listAdmins); // list all admins
router.post('/register', register);
router.post('/login', login);
router.get('/:userId', getUserDetails);
router.put('/:userId', updateUser);

module.exports = router;

// admin auth
// /api/v1/admin/register
// /api/v1/admin/login
// GET user by id ====/api/v1/admin/:userId
// PUT user infor ====/api/v1/admin/:userId
