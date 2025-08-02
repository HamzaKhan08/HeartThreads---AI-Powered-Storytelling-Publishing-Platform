const express = require('express');
const router = express.Router();
const { signup, login, logout, googleLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);

module.exports = router;
