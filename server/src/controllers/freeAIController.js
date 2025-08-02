const freeAIService = require('../services/freeAIService');

// Generate creative prompts based on user input
const generatePrompts = async (req, res) => {
  try {
    const { topic, emotionalTone, writingStyle } = req.body;

    // Validate required fields
    if (!topic || !emotionalTone || !writingStyle) {
      return res.status(400).json({
        success: false,
        message: 'Topic, emotional tone, and writing style are required'
      });
    }

    // Set headers for SSE if requested
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial progress
      res.write(`data: ${JSON.stringify({ type: 'progress', stage: 0, message: 'Initializing fast AI models...' })}\n\n`);

      // Faster progress stages for prompt generation
      const progressStages = [
        { stage: 1, message: 'Connecting to fast AI service...', delay: 500 },
        { stage: 2, message: 'Analyzing topic and style...', delay: 1000 },
        { stage: 3, message: 'Generating creative prompts...', delay: 2000 },
        { stage: 4, message: 'Finalizing prompt selection...', delay: 3000 }
      ];

      // Send progress updates
      progressStages.forEach(({ stage, message, delay }) => {
        setTimeout(() => {
          res.write(`data: ${JSON.stringify({ type: 'progress', stage, message })}\n\n`);
        }, delay);
      });

      // Generate prompts with progress tracking
      setTimeout(async () => {
        try {
          const prompts = await freeAIService.generatePrompts(topic, emotionalTone, writingStyle);
          
          res.write(`data: ${JSON.stringify({ 
            type: 'progress', 
            stage: 5, 
            message: 'Prompts generated successfully!' 
          })}\n\n`);
          
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            success: true,
            prompts,
            message: 'Prompts generated successfully'
          })}\n\n`);
          
          res.end();
        } catch (error) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            success: false,
            message: error.message || 'Failed to generate prompts'
          })}\n\n`);
          res.end();
        }
      }, 4000);

      return;
    }

    // Regular request handling
    const prompts = await freeAIService.generatePrompts(topic, emotionalTone, writingStyle);

    res.json({
      success: true,
      prompts,
      message: 'Prompts generated successfully'
    });
  } catch (error) {
    console.error('Error in generatePrompts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate prompts'
    });
  }
};

// Generate a complete story with real-time progress
const generateStory = async (req, res) => {
  try {
    const { topic, emotionalTone, writingStyle, length, customPrompt } = req.body;

    // Validate required fields
    if (!topic || !emotionalTone || !writingStyle) {
      return res.status(400).json({
        success: false,
        message: 'Topic, emotional tone, and writing style are required'
      });
    }

    // Validate length
    if (length && ![1, 2, 3].includes(length)) {
      return res.status(400).json({
        success: false,
        message: 'Length must be 1 (short), 2 (medium), or 3 (long)'
      });
    }

    // Set headers for SSE if requested
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const targetWords = length === 1 ? 800 : length === 2 ? 1200 : 1800;
      
      // Send initial progress
      res.write(`data: ${JSON.stringify({ type: 'progress', stage: 0, message: 'Initializing fast AI models...' })}\n\n`);

      // Faster progress stages for story generation
      const progressStages = [
        { stage: 1, message: 'Connecting to fast AI service...', delay: 1000 },
        { stage: 2, message: 'Analyzing story requirements...', delay: 2000 },
        { stage: 3, message: `Generating ${targetWords}-word story content...`, delay: 4000 },
        { stage: 4, message: 'Developing characters and plot...', delay: 8000 },
        { stage: 5, message: 'Adding vivid descriptions...', delay: 12000 },
        { stage: 6, message: 'Creating engaging title...', delay: 16000 },
        { stage: 7, message: 'Finalizing and formatting...', delay: 20000 },
        { stage: 8, message: 'Almost done...', delay: 24000 }
      ];

      // Send progress updates
      progressStages.forEach(({ stage, message, delay }) => {
        setTimeout(() => {
          res.write(`data: ${JSON.stringify({ type: 'progress', stage, message })}\n\n`);
        }, delay);
      });

      // Generate story with progress tracking
      setTimeout(async () => {
        try {
          const story = await freeAIService.generateStory(
            topic,
            emotionalTone,
            writingStyle,
            length || 2,
            customPrompt
          );
          
          res.write(`data: ${JSON.stringify({ 
            type: 'progress', 
            stage: 9, 
            message: 'Story generated successfully!' 
          })}\n\n`);
          
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            success: true,
            story,
            message: 'Story generated successfully'
          })}\n\n`);
          
          res.end();
        } catch (error) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            success: false,
            message: error.message || 'Failed to generate story'
          })}\n\n`);
          res.end();
        }
      }, 28000);

      return;
    }

    // Regular request handling
    const story = await freeAIService.generateStory(
      topic,
      emotionalTone,
      writingStyle,
      length || 2,
      customPrompt
    );

    res.json({
      success: true,
      story,
      message: 'Story generated successfully'
    });
  } catch (error) {
    console.error('Error in generateStory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate story'
    });
  }
};

// Get AI service status
const getAIStatus = async (req, res) => {
  try {
    const status = await freeAIService.checkStatus();
    
    res.json({
      success: status.success,
      status: status.status,
      message: status.message,
      provider: status.provider,
      model: status.model,
      fastModel: status.fastModel,
      features: {
        storyGeneration: status.success,
        promptGeneration: status.success,
        storyImprovement: false, // Not implemented in free service yet
        outlineGeneration: false  // Not implemented in free service yet
      }
    });
  } catch (error) {
    console.error('Error in getAIStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI service status'
    });
  }
};

module.exports = {
  generatePrompts,
  generateStory,
  getAIStatus
}; 