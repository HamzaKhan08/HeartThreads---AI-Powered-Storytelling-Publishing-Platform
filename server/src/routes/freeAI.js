const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generatePrompts,
  generateStory,
  getAIStatus
} = require('../controllers/freeAIController');

// Get AI service status (public endpoint)
router.get('/status', getAIStatus);

// Generate prompts (requires authentication)
router.post('/prompts', auth, generatePrompts);

// Generate complete story (requires authentication)
router.post('/story', auth, generateStory);

module.exports = router; 