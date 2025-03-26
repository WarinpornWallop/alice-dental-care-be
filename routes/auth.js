const express = require('express');
const {register, login, getMe, googleLogin, googleCallback, googleSuccess, logout} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback, googleSuccess);
router.get('/logout', logout);

module.exports = router;