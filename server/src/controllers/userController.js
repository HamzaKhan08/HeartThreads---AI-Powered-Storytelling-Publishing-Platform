const User = require('../models/User');
const Story = require('../models/Story');
const { sendEmail } = require('../utils/email');

exports.getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    googleId: req.user.googleId,
    isAnonymous: req.user.isAnonymous,
    profilePic: req.user.profilePic,
    createdAt: req.user.createdAt
  });
};

exports.updateProfile = async (req, res) => {
  const { username, name, isAnonymous, profilePic } = req.body;
  
  try {
    // Check if username is being changed and if it's already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username is already taken' 
        });
      }
    }

    // Update user fields
    if (username) req.user.username = username;
    if (name !== undefined) req.user.name = name;
    if (isAnonymous !== undefined) req.user.isAnonymous = isAnonymous;
    if (profilePic) req.user.profilePic = profilePic;
    
    await req.user.save();

    // Return updated user data
    res.json({
      id: req.user._id,
      username: req.user.username,
      name: req.user.name,
      email: req.user.email,
      googleId: req.user.googleId,
      isAnonymous: req.user.isAnonymous,
      profilePic: req.user.profilePic,
      createdAt: req.user.createdAt,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ 
      message: 'Failed to update profile. Please try again.' 
    });
  }
};

exports.contactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'your@email.com',
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`
    });
    res.json({ message: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};

exports.getAuthorProfile = async (req, res) => {
  try {
    const { authorId } = req.params;
    
    // Get author data
    const author = await User.findById(authorId).select('username name isAnonymous profilePic createdAt followers following pendingFollowRequests');
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    // Get author's stories
    const stories = await Story.find({ 
      author: authorId,
      isAnonymous: false 
    })
    .sort({ createdAt: -1 })
    .select('title content tags createdAt views likedBy readTime');
    
    // Calculate author stats
    const totalStories = stories.length;
    const totalViews = stories.reduce((sum, story) => sum + (story.views || 0), 0);
    const totalLikes = stories.reduce((sum, story) => sum + (story.likedBy?.length || 0), 0);
    const totalReadTime = stories.reduce((sum, story) => sum + (story.readTime || 0), 0);
    
    // Get followers and following with user details
    const followers = await User.find({ _id: { $in: author.followers || [] } })
      .select('username name profilePic isAnonymous')
      .sort({ username: 1 }); // Sort alphabetically
    
    const following = await User.find({ _id: { $in: author.following || [] } })
      .select('username name profilePic isAnonymous')
      .sort({ username: 1 }); // Sort alphabetically
    
    const followersCount = author.followers?.length || 0;
    const followingCount = author.following?.length || 0;
    
    // Check if current user is following this author
    let isFollowing = false;
    let hasPendingRequest = false;
    if (req.user) {
      isFollowing = author.followers?.includes(req.user._id) || false;
      hasPendingRequest = author.pendingFollowRequests?.includes(req.user._id) || false;
    }
    
    // Transform stories for response
    const transformedStories = stories.map(story => ({
      id: story._id,
      title: story.title,
      content: story.content.substring(0, 200) + (story.content.length > 200 ? '...' : ''),
      tags: story.tags || [],
      views: story.views || 0,
      likes: story.likedBy?.length || 0,
      readTime: story.readTime || 0,
      publishedAt: formatTimeAgo(story.createdAt)
    }));
    
    // Transform followers and following for response
    const transformedFollowers = followers.map(follower => ({
      id: follower._id,
      username: follower.isAnonymous ? 'Anonymous' : follower.username,
      name: follower.name || follower.username,
      profilePic: follower.profilePic,
      isAnonymous: follower.isAnonymous
    }));
    
    const transformedFollowing = following.map(followingUser => ({
      id: followingUser._id,
      username: followingUser.isAnonymous ? 'Anonymous' : followingUser.username,
      name: followingUser.name || followingUser.username,
      profilePic: followingUser.profilePic,
      isAnonymous: followingUser.isAnonymous
    }));
    
    // Get top tags from author's stories
    const allTags = stories.flatMap(story => story.tags || []);
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    const authorProfile = {
      id: author._id,
      username: author.username,
      name: author.name || author.username,
      isAnonymous: author.isAnonymous,
      profilePic: author.profilePic,
      joinedAt: formatTimeAgo(author.createdAt),
      stats: {
        stories: totalStories,
        views: totalViews,
        likes: totalLikes,
        totalReadTime,
        followers: followersCount,
        following: followingCount
      },
      followers: transformedFollowers || [],
      following: transformedFollowing || [],
      topTags,
      stories: transformedStories,
      isFollowing,
      hasPendingRequest,
      canFollow: req.user && req.user._id.toString() !== authorId
    };
    
    res.json(authorProfile);
  } catch (err) {
    console.error('Error fetching author profile:', err);
    res.status(500).json({ message: 'Failed to fetch author profile' });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 14) {
    return '1 week ago';
  } else {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} weeks ago`;
  }
};
