const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  followUser,
  likeStory,
  likeCollection,
  addComment,
  getComments,
  deleteComment,
  getFollowers,
  getFollowing,
  sendFollowRequest,
  getPendingFollowRequests,
  approveFollowRequest,
  rejectFollowRequest,
  getNotifications,
  markNotificationsRead
} = require('../controllers/socialController');

// Follow/Unfollow routes
router.post('/follow/:userId', auth, followUser);

// Follow request routes
router.post('/follow-request/:userId', auth, sendFollowRequest);
router.get('/pending-follow-requests', auth, getPendingFollowRequests);
router.post('/approve-follow-request', auth, approveFollowRequest);
router.post('/reject-follow-request', auth, rejectFollowRequest);
router.get('/notifications', auth, getNotifications);
router.post('/notifications/mark-read', auth, markNotificationsRead);

// Like routes
router.post('/stories/:storyId/like', auth, likeStory);
router.post('/collections/:collectionId/like', auth, likeCollection);

// Comment routes
router.post('/stories/:storyId/comments', auth, addComment);
router.get('/stories/:storyId/comments', getComments);
router.delete('/stories/:storyId/comments/:commentId', auth, deleteComment);

// Followers/Following routes
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

module.exports = router;