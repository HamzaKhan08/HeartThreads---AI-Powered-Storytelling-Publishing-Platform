const Story = require('../models/Story');
const Collection = require('../models/Collection');

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Count user's stories
    const storiesWritten = await Story.countDocuments({ author: userId });
    
    // Count user's collections
    const collectionsCreated = await Collection.countDocuments({ author: userId });
    
    // Get total views from user's stories
    const userStories = await Story.find({ author: userId });
    const totalViews = userStories.reduce((sum, story) => sum + (story.views || 0), 0);
    
    // Get total likes from user's stories
    const totalLikes = userStories.reduce((sum, story) => sum + (story.likedBy?.length || 0), 0);

    res.json({
      storiesWritten,
      collectionsCreated,
      totalViews,
      totalLikes
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's recent stories
    const recentStories = await Story.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title createdAt');

    // Get user's recent collections
    const recentCollections = await Collection.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title createdAt');

    // Combine and format activities
    const activities = [];

    // Add story creation activities
    recentStories.forEach(story => {
      activities.push({
        id: `story_${story._id}`,
        type: 'story_created',
        description: `You wrote "${story.title}"`,
        createdAt: story.createdAt
      });
    });

    // Add collection creation activities
    recentCollections.forEach(collection => {
      activities.push({
        id: `collection_${collection._id}`,
        type: 'collection_created',
        description: `You created collection "${collection.title}"`,
        createdAt: collection.createdAt
      });
    });

    // Sort by creation date (most recent first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return only the requested number of activities
    const limitedActivities = activities.slice(0, limit);

    res.json({
      activities: limitedActivities
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Failed to fetch user activity' });
  }
};

module.exports = {
  getUserStats,
  getUserActivity
}; 