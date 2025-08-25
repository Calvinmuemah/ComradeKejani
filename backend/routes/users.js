const express = require('express');
const router = express.Router();
const { register, login, getUserDetails, updateUser, listAdmins, uploadAvatar, deleteAvatar } = require('../controllers/users');
const upload = require('../middlewares/upload');

router.get('/', listAdmins); // list all admins
router.post('/register', register);
router.post('/login', login);
router.get('/:userId', getUserDetails);
// Unified update accepts multipart (optional avatar file) or JSON
router.put('/:userId', upload.single('avatar'), updateUser);
router.post('/:userId/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/:userId/avatar', deleteAvatar);

module.exports = router;

// admin auth
// /api/v1/admin/register
// /api/v1/admin/login
// GET user by id ====/api/v1/admin/:userId
// PUT user infor ====/api/v1/admin/:userId
