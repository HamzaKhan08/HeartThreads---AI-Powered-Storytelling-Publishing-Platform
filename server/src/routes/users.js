const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateProfile, contactUs, getAuthorProfile } = require('../controllers/userController');
const { getUserStats, getUserActivity } = require('../controllers/userStatsController');
const { getUserStories } = require('../controllers/storyController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);
router.get('/stats', auth, getUserStats);
router.get('/activity', auth, getUserActivity);
router.get('/stories', auth, getUserStories);
router.post('/contact', contactUs);
router.get('/author/:authorId', getAuthorProfile); // Public route for author profiles

module.exports = router;
