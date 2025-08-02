const User = require('../models/User');
const Story = require('../models/Story');
const Collection = require('../models/Collection');

// Follow/Unfollow user
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUserId }
      });
      res.json({ message: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: currentUserId }
      });
      res.json({ message: 'Followed successfully', following: true });
    }
  } catch (error) {
    console.error('Error in followUser:', error);
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
};

// Like/Unlike story
const likeStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    const story = await Story.findById(storyId).populate('author');
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    const isLiked = story.likedBy.includes(userId);
    if (isLiked) {
      // Unlike
      await Story.findByIdAndUpdate(storyId, {
        $pull: { likedBy: userId }
      });
      res.json({ message: 'Story unliked', liked: false });
    } else {
      // Like
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { likedBy: userId }
      });
      // Send notification to author if liker is not the author
      if (story.author && story.author._id.toString() !== userId.toString()) {
        const author = await User.findById(story.author._id);
        author.notifications.push({
          type: 'story_like',
          message: `${user.username} liked your story: ${story.title}`,
          from: userId
        });
        await author.save();
      }
      res.json({ message: 'Story liked', liked: true });
    }
  } catch (error) {
    console.error('Error in likeStory:', error);
    res.status(500).json({ message: 'Failed to like/unlike story' });
  }
};

// Like/Unlike collection
const likeCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id || req.user.id;

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const isLiked = collection.likedBy.includes(userId);
    const io = req.app.get('io');
    let updatedCollection;

    if (isLiked) {
      // Unlike
      updatedCollection = await Collection.findByIdAndUpdate(collectionId, {
        $pull: { likedBy: userId }
      }, { new: true });
      if (io) io.emit('collectionUnliked', {
        collectionId,
        likes: updatedCollection.likedBy.length,
        likedBy: updatedCollection.likedBy,
        userId
      });
      res.json({ message: 'Collection unliked', liked: false, likes: updatedCollection.likedBy.length, likedBy: updatedCollection.likedBy });
    } else {
      // Like
      updatedCollection = await Collection.findByIdAndUpdate(collectionId, {
        $addToSet: { likedBy: userId }
      }, { new: true });
      if (io) io.emit('collectionLiked', {
        collectionId,
        likes: updatedCollection.likedBy.length,
        likedBy: updatedCollection.likedBy,
        userId
      });
      res.json({ message: 'Collection liked', liked: true, likes: updatedCollection.likedBy.length, likedBy: updatedCollection.likedBy });
    }
  } catch (error) {
    console.error('Error in likeCollection:', error);
    res.status(500).json({ message: 'Failed to like/unlike collection' });
  }
};

// Add comment to story
const addComment = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { content } = req.body;
    const userId = req.user._id || req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const comment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    await Story.findByIdAndUpdate(storyId, {
      $push: { comments: comment }
    });

    // Populate user info for the comment
    const populatedStory = await Story.findById(storyId)
      .populate('comments.user', 'username name isAnonymous');

    const newComment = populatedStory.comments[populatedStory.comments.length - 1];

    res.json({ 
      message: 'Comment added successfully', 
      comment: newComment 
    });
  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Get comments for a story
const getComments = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId)
      .populate('comments.user', 'username name isAnonymous')
      .select('comments');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json({ comments: story.comments });
  } catch (error) {
    console.error('Error in getComments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { storyId, commentId } = req.params;
    const userId = req.user._id || req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const comment = story.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author or story author
    if (comment.user.toString() !== userId && story.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Story.findByIdAndUpdate(storyId, {
      $pull: { comments: { _id: commentId } }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'username name isAnonymous profilePic')
      .select('followers');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Error in getFollowers:', error);
    res.status(500).json({ message: 'Failed to fetch followers' });
  }
};

// Get user's following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('following', 'username name isAnonymous profilePic')
      .select('following');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Error in getFollowing:', error);
    res.status(500).json({ message: 'Failed to fetch following' });
  }
};

// Send follow request
const sendFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;
    if (currentUserId === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    // If already requested
    if (userToFollow.pendingFollowRequests.includes(currentUserId)) {
      return res.status(400).json({ message: 'Follow request already sent' });
    }
    // If already following
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already following' });
    }
    // Add to pending requests
    userToFollow.pendingFollowRequests.push(currentUserId);
    userToFollow.notifications.push({
      type: 'follow_request',
      message: 'You have a new follow request',
      from: currentUserId
    });
    await userToFollow.save();
    res.json({ message: 'Follow request sent' });
  } catch (error) {
    console.error('Error in sendFollowRequest:', error);
    res.status(500).json({ message: 'Failed to send follow request' });
  }
};

// Get pending follow requests for the logged-in user
const getPendingFollowRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate('pendingFollowRequests', 'username name profilePic');
    res.json({ pendingFollowRequests: user.pendingFollowRequests });
  } catch (error) {
    console.error('Error in getPendingFollowRequests:', error);
    res.status(500).json({ message: 'Failed to fetch pending follow requests' });
  }
};

// Approve follow request
const approveFollowRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; // The receiver
    const { requesterId } = req.body;
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove from pending
    user.pendingFollowRequests = user.pendingFollowRequests.filter(id => id.toString() !== requesterId);
    // Add to followers/following
    user.followers.addToSet(requesterId);
    requester.following.addToSet(userId);
    // Add notifications
    user.notifications.push({
      type: 'follow_approved',
      message: `You approved a follow request from ${requester.username}`,
      from: requesterId
    });
    requester.notifications.push({
      type: 'follow_approved',
      message: `${user.username} approved your follow request`,
      from: userId
    });
    await user.save();
    await requester.save();
    res.json({ message: 'Follow request approved' });
  } catch (error) {
    console.error('Error in approveFollowRequest:', error);
    res.status(500).json({ message: 'Failed to approve follow request' });
  }
};

// Reject follow request
const rejectFollowRequest = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; // The receiver
    const { requesterId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove from pending
    user.pendingFollowRequests = user.pendingFollowRequests.filter(id => id.toString() !== requesterId);
    await user.save();
    res.json({ message: 'Follow request rejected' });
  } catch (error) {
    console.error('Error in rejectFollowRequest:', error);
    res.status(500).json({ message: 'Failed to reject follow request' });
  }
};

// Get notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate('notifications.from', 'username name profilePic');
    res.json({ notifications: user.notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark all notifications as read for the logged-in user
const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.notifications.forEach(n => n.read = true);
    await user.save();
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error in markNotificationsRead:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

module.exports = {
  followUser,
  likeStory,
  likeCollection,
  addComment,
  getComments,
  deleteComment,
  getFollowers,
  getFollowing,
  // New follow request/notification logic
  sendFollowRequest,
  getPendingFollowRequests,
  approveFollowRequest,
  rejectFollowRequest,
  getNotifications,
  markNotificationsRead,
}; 