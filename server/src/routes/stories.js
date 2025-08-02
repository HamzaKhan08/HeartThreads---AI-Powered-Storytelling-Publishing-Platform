const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrict = require('../middleware/restrict');
const { 
  createStory, 
  getStories, 
  getStoryById, 
  getAllTags, 
  searchStories, 
  toggleLike, 
  deleteStory, 
  reactToStory, 
  toggleBookmark, 
  getBookmarkedStories,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getTagCounts
} = require('../controllers/storyController');

// Specific routes first
router.get('/tags', getAllTags);
router.get('/tags/counts', getTagCounts);
router.get('/search', searchStories);

// Bookmark routes (must come before parameterized routes)
router.get('/bookmarks/user', auth, getBookmarkedStories);

// General routes
router.get('/', restrict, getStories);
router.post('/', auth, createStory);

// Parameterized routes last
router.get('/:id', restrict, getStoryById);
router.post('/:id/like', auth, toggleLike);
router.delete('/:id', auth, deleteStory);

// Emoji reaction route
router.post('/:storyId/react', auth, reactToStory);

// Bookmark toggle route
router.post('/:id/bookmark', auth, toggleBookmark);



// Comment routes
router.post('/:storyId/comments', auth, addComment);
router.put('/:storyId/comments/:commentId', auth, updateComment);
router.delete('/:storyId/comments/:commentId', auth, deleteComment);
router.post('/:storyId/comments/:commentId/like', auth, toggleCommentLike);

// Reply routes
router.put('/:storyId/comments/:commentId/replies/:replyId', auth, updateComment);
router.delete('/:storyId/comments/:commentId/replies/:replyId', auth, deleteComment);
router.post('/:storyId/comments/:commentId/replies/:replyId/like', auth, toggleCommentLike);

module.exports = router;
