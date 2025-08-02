const Story = require('../models/Story');
const Collection = require('../models/Collection');

const createStory = async (req, res) => {
  const { title, content, tags, isAnonymous, storyType, collection } = req.body;
  try {
    const story = await Story.create({
      title,
      content,
      tags,
      isAnonymous: isAnonymous || req.user.isAnonymous,
      storyType: storyType || 'Fiction',
      collection: collection || null,
      author: req.user._id
    });

    if (collection) {
      const col = await Collection.findById(collection);
      if (!col) {
        console.error('Collection not found:', collection);
      } else {
        const updatedCol = await Collection.findByIdAndUpdate(
          collection,
          { $push: { stories: story._id } },
          { new: true }
        );
        if (!updatedCol.stories.includes(story._id)) {
          console.error('Story ID not found in updated collection stories array!');
        }
      }
    }

    await story.populate('author', 'username isAnonymous');
    res.status(201).json({
      ...story.toObject(),
      author: story.isAnonymous || story.author.isAnonymous ? 'Anonymous' : story.author.username
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { tags, sortBy = 'recent', limit = 10, page = 1, author, likedBy } = req.query;
    const isGuest = req.isGuest;
    
    // Limit guest users to only 5 stories total, no pagination
    if (isGuest) {
      const guestLimit = 5;
      const stories = await Story.find({ collection: { $exists: false } })
        .sort({ createdAt: -1 })
        .limit(guestLimit)
        .populate('author', 'username isAnonymous');
      
      const transformedStories = stories.map(story => {
        const storyObj = story.toObject();
        return {
          id: storyObj._id,
          title: storyObj.title,
          content: storyObj.content,
          author: storyObj.isAnonymous || storyObj.author.isAnonymous ? 'Anonymous' : storyObj.author.username,
          authorInitials: storyObj.isAnonymous || storyObj.author.isAnonymous ? 'A' : storyObj.author.username.substring(0, 2).toUpperCase(),
          authorColor: storyObj.isAnonymous || storyObj.author.isAnonymous ? 'gray' : 'primary',
          tags: storyObj.tags || [],
          likes: storyObj.likedBy?.length || 0,
          likedBy: storyObj.likedBy || [],
          publishedAt: formatTimeAgo(storyObj.createdAt),
          readTime: calculateReadTime(storyObj.content),
          isSeries: false,
          image: null,
          isAnonymous: storyObj.isAnonymous
        };
      });
      
      return res.json({
        stories: transformedStories,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalStories: guestLimit,
          hasMore: false,
          isGuest: true
        }
      });
    }
    
    // Build query for stories not in collections
    let query = { collection: { $exists: false } };

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      if (req.user && req.user._id) {
        // Authenticated: stories with tags OR user's own stories, but always not in collections
        query = {
          $and: [
            { collection: { $exists: false } },
            {
              $or: [
                { tags: { $in: tagArray } },
                { author: req.user._id }
              ]
            }
          ]
        };
      } else {
        // Guest: only stories with tags
        query = {
          collection: { $exists: false },
          tags: { $in: tagArray }
        };
      }
    }
    
    // Filter by author
    if (author) {
      query.author = author;
    }
    
    // Filter by likedBy (stories liked by a specific user)
    if (likedBy) {
      query.likedBy = likedBy;
    }
    
    // Filter by storyType
    if (req.query.storyType) {
      query.storyType = req.query.storyType;
    }
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'popular':
        sort = { likedBy: -1, createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'shortest':
        // We'll sort in-memory after fetching
        sort = {};
        break;
      case 'longest':
        // We'll sort in-memory after fetching
        sort = {};
        break;
      case 'recent':
      default:
        sort = { createdAt: -1 };
        break;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    let stories = await Story.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username isAnonymous');
    
    // After fetching stories, apply minLikes filter if provided
    let minLikes = parseInt(req.query.minLikes) || 0;
    if (minLikes > 0) {
      stories = stories.filter(story => (story.likedBy?.length || 0) >= minLikes);
    }
    
    // Custom sorting function that prioritizes user's own stories
    const sortStories = (a, b) => {
      // First, check if either story belongs to the current user
      const aIsUserStory = req.user && req.user._id && a.author && 
                          (a.author._id || a.author.id) === req.user._id.toString();
      const bIsUserStory = req.user && req.user._id && b.author && 
                          (b.author._id || b.author.id) === req.user._id.toString();
      
      // If one is user's story and the other isn't, prioritize user's story
      if (aIsUserStory && !bIsUserStory) return -1;
      if (!aIsUserStory && bIsUserStory) return 1;
      
      // If both are user's stories or both are not, apply normal sorting
      if (sortBy === 'popular') {
        const aLikes = a.likedBy?.length || 0;
        const bLikes = b.likedBy?.length || 0;
        if (aLikes !== bLikes) {
          return bLikes - aLikes;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'shortest') {
        const aRead = calculateReadTime(a.content);
        const bRead = calculateReadTime(b.content);
        if (aRead !== bRead) {
          return aRead - bRead;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'longest') {
        const aRead = calculateReadTime(a.content);
        const bRead = calculateReadTime(b.content);
        if (aRead !== bRead) {
          return bRead - aRead;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        // Apply other sorts
        if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      }
    };
    
    // Apply custom sorting
    stories = stories.sort(sortStories);
    
    // Advanced sorting
    if (sortBy === 'mostCommented') {
      stories = stories.sort((a, b) => {
        const aComments = a.comments?.length || 0;
        const bComments = b.comments?.length || 0;
        if (aComments !== bComments) {
          return bComments - aComments;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortBy === 'mostViewed') {
      stories = stories.sort((a, b) => {
        const aViews = a.views || 0;
        const bViews = b.views || 0;
        if (aViews !== bViews) {
          return bViews - aViews;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortBy === 'alphabetical') {
      stories = stories.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    } else if (sortBy === 'random') {
      // Fisher-Yates shuffle
      for (let i = stories.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stories[i], stories[j]] = [stories[j], stories[i]];
      }
    }
    
    // Get total count for pagination
    const total = await Story.countDocuments(query);
    
    // Transform stories for frontend
    const transformedStories = stories.map(story => {
      const storyObj = story.toObject();
      const isAnonymous = storyObj.isAnonymous || (storyObj.author && storyObj.author.isAnonymous);
      const authorUsername = storyObj.author ? storyObj.author.username : 'Unknown';
      const readTime = calculateReadTime(storyObj.content);
      const isUserStory = req.user && req.user._id && storyObj.author && 
                         (storyObj.author._id || storyObj.author.id) === req.user._id.toString();
      
      return {
        id: storyObj._id,
        title: storyObj.title,
        content: storyObj.content,
        author: isAnonymous ? 'Anonymous' : authorUsername,
        originalAuthor: isAnonymous ? authorUsername : null,
        authorId: storyObj.author ? (storyObj.author._id || storyObj.author.id) : null,
        authorInitials: isAnonymous ? 'A' : (authorUsername.substring(0, 2).toUpperCase()),
        authorColor: isAnonymous ? 'gray' : 'primary',
        tags: storyObj.tags || [],
        likes: storyObj.likedBy?.length || 0,
        likedBy: storyObj.likedBy || [],
        publishedAt: formatTimeAgo(storyObj.createdAt),
        readTime,
        readTimeText: `${readTime} min read`,
        isSeries: false,
        image: null,
        isAnonymous: isAnonymous,
        isUserStory: isUserStory
      };
    });
    
    res.json({
      stories: transformedStories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalStories: total,
        hasMore: skip + stories.length < total,
        isGuest: false
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username isAnonymous createdAt')
      .populate('comments.user', 'username isAnonymous')
      .populate('comments.replies.user', 'username isAnonymous');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Increment view count (only for authenticated users or track unique views)
    if (req.user) {
      // Check if this is a unique view (you might want to implement view tracking per user)
      story.views = (story.views || 0) + 1;
      await story.save();
    } else {
      // For guest users, still increment but you might want to implement session-based tracking
      story.views = (story.views || 0) + 1;
      await story.save();
    }
    
    const storyObj = story.toObject();
    const isAnonymous = storyObj.isAnonymous || (storyObj.author && storyObj.author.isAnonymous);
    const authorUsername = storyObj.author ? storyObj.author.username : 'Unknown';
    
    // Get additional author information if not anonymous
    let authorStats = {
      followers: 0,
      stories: 0,
      joinedAt: 'Recently'
    };
    
    if (!isAnonymous && storyObj.author) {
      const User = require('../models/User');
      const author = await User.findById(storyObj.author._id);
      if (author) {
        authorStats.followers = author.followers?.length || 0;
        authorStats.joinedAt = formatTimeAgo(author.createdAt);
        
        // Count author's stories
        const authorStories = await Story.countDocuments({ 
          author: storyObj.author._id,
          isAnonymous: false 
        });
        authorStats.stories = authorStories;
      }
    }
    
    // Transform comments to include user info and filter deleted comments
    const transformedComments = (storyObj.comments || [])
      .filter(comment => !comment.isDeleted)
      .map(comment => ({
        _id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: comment.likes || 0,
        likedBy: comment.likedBy || [],
        isEdited: comment.isEdited || false,
        user: {
          _id: comment.user?._id,
          username: comment.user?.isAnonymous ? 'Anonymous' : (comment.user?.username || 'Unknown'),
          isAnonymous: comment.user?.isAnonymous || false
        },
        replies: (comment.replies || [])
          .filter(reply => !reply.isDeleted)
          .map(reply => ({
            _id: reply._id,
            content: reply.content,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            likes: reply.likes || 0,
            likedBy: reply.likedBy || [],
            user: {
              _id: reply.user?._id,
              username: reply.user?.isAnonymous ? 'Anonymous' : (reply.user?.username || 'Unknown'),
              isAnonymous: reply.user?.isAnonymous || false
            }
          }))
      }));
    
    const transformedStory = {
      id: storyObj._id,
      title: storyObj.title,
      content: storyObj.content,
      author: isAnonymous ? 'Anonymous' : authorUsername,
      originalAuthor: isAnonymous ? authorUsername : null,
      authorId: storyObj.author ? (storyObj.author._id || storyObj.author.id) : null,
      authorInitials: isAnonymous ? 'A' : (authorUsername.substring(0, 2).toUpperCase()),
      authorColor: isAnonymous ? 'gray' : 'primary',
      authorFollowers: authorStats.followers,
      authorStories: authorStats.stories,
      authorJoined: authorStats.joinedAt,
      tags: storyObj.tags || [],
      views: storyObj.views || 0,
      likes: storyObj.likedBy?.length || 0,
      likedBy: storyObj.likedBy || [],
      comments: transformedComments,
      commentCount: transformedComments.length,
      publishedAt: formatTimeAgo(storyObj.createdAt),
      updatedAt: storyObj.updatedAt ? formatTimeAgo(storyObj.updatedAt) : null,
      readTime: calculateReadTime(storyObj.content),
      isSeries: false,
      image: null,
      isAnonymous: isAnonymous
    };
    
    res.json(transformedStory);
  } catch (err) {
    console.error('Error fetching story:', err);
    res.status(500).json({ message: 'Failed to fetch story' });
  }
};

// Delete a story
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if user is the author of the story
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own stories' });
    }
    
    await Story.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete story' });
  }
};

// Toggle like on a story
const toggleLike = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author');
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    const userId = req.user._id;
    const user = await require('../models/User').findById(userId);
    const likeIndex = story.likedBy.indexOf(userId);
    let liked = false;
    if (likeIndex > -1) {
      // Unlike
      story.likedBy.splice(likeIndex, 1);
    } else {
      // Like
      story.likedBy.push(userId);
      liked = true;
    }
    await story.save();
    // Send notification to author if liked and liker is not the author
    if (liked && story.author && story.author._id.toString() !== userId.toString()) {
      const author = await require('../models/User').findById(story.author._id);
      author.notifications.push({
        type: 'story_like',
        message: `${user.username} liked your story: ${story.title}`,
        from: userId
      });
      await author.save();
    }
    res.json({ 
      likes: story.likedBy.length,
      isLiked: story.likedBy.includes(userId)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
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

// Helper function to calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime;
};

// Get all unique tags
const getAllTags = async (req, res) => {
  try {
    const dbTags = await Story.distinct('tags');
    // Only return tags that are actually used
    const allTags = dbTags.filter(tag => tag && tag.trim() !== '').sort();
    res.json({ tags: allTags });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

// Search stories, collections, authors, and tags
const searchStories = async (req, res) => {
  try {
    const { 
      query, 
      type = 'all', // 'all', 'stories', 'collections', 'authors', 'tags'
      limit = 20, 
      page = 1,
      sortBy = 'relevance' // 'relevance', 'recent', 'popular'
    } = req.query;
    
    const isGuest = req.isGuest;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Create multiple search patterns for better matching
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    const searchRegex = new RegExp(searchQuery, 'i');
    
    // Create regex patterns for each search term
    const searchTermRegexes = searchTerms.map(term => new RegExp(term, 'i'));
    
    let results = {
      stories: [],
      collections: [],
      authors: [],
      tags: [],
      totalResults: 0
    };

    // Search stories
    if (type === 'all' || type === 'stories') {
      const storyQuery = {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }, // Search for exact tag match
          { tags: { $in: searchTermRegexes } } // Search for partial tag matches
        ]
      };

      // Add author search if not guest
      if (!isGuest) {
        storyQuery.$or.push({ 'author.username': searchRegex });
        storyQuery.$or.push({ 'author.name': searchRegex });
      }

      let storySort = {};
      switch (sortBy) {
        case 'recent':
          storySort = { createdAt: -1 };
          break;
        case 'popular':
          storySort = { createdAt: -1 }; // Will be sorted by likedBy length after query
          break;
        case 'relevance':
        default:
          // Sort by relevance (exact matches first, then partial)
          storySort = { createdAt: -1 };
          break;
      }

      let stories = await Story.find(storyQuery)
        .sort(storySort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username isAnonymous name');

      // Sort by likedBy length for popular stories
      if (sortBy === 'popular') {
        stories = stories.sort((a, b) => {
          const aLikes = a.likedBy?.length || 0;
          const bLikes = b.likedBy?.length || 0;
          if (aLikes !== bLikes) {
            return bLikes - aLikes;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }

      const transformedStories = stories.map(story => {
        const storyObj = story.toObject();
        return {
          id: storyObj._id,
          type: 'story',
          title: storyObj.title,
          content: storyObj.content.substring(0, 200) + '...',
          author: storyObj.isAnonymous || (storyObj.author && storyObj.author.isAnonymous) ? 'Anonymous' : (storyObj.author ? storyObj.author.username : 'Unknown'),
          authorName: storyObj.author && storyObj.author.name ? storyObj.author.name : (storyObj.author ? storyObj.author.username : 'Unknown'),
          tags: storyObj.tags || [],
          likes: storyObj.likedBy?.length || 0,
          publishedAt: formatTimeAgo(storyObj.createdAt),
          readTime: calculateReadTime(storyObj.content),
          isAnonymous: storyObj.isAnonymous,
          relevance: calculateRelevance(storyObj, searchQuery, searchTerms)
        };
      });

      // Sort by relevance if relevance sorting is requested
      if (sortBy === 'relevance') {
        transformedStories.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      }

      results.stories = transformedStories;
    }

    // Search authors (users)
    if (type === 'all' || type === 'authors') {
      const User = require('../models/User');
      const authorQuery = {
        $or: [
          { username: searchRegex },
          { name: searchRegex }
        ]
      };

      const authors = await User.find(authorQuery)
        .select('username name isAnonymous createdAt')
        .limit(10);

      const transformedAuthors = authors.map(author => ({
        id: author._id,
        type: 'author',
        username: author.username,
        name: author.name || author.username,
        isAnonymous: author.isAnonymous,
        joinedAt: formatTimeAgo(author.createdAt),
        relevance: calculateAuthorRelevance(author, searchQuery, searchTerms)
      }));

      // Sort by relevance
      transformedAuthors.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      results.authors = transformedAuthors;
    }

    // Search tags
    if (type === 'all' || type === 'tags') {
      const tags = await Story.distinct('tags');
      
      const matchingTags = tags.filter(tag => {
        if (!tag) return false;
        const tagLower = tag.toLowerCase();
        const queryLower = searchQuery.toLowerCase();
        
        // Check for exact match
        if (tagLower === queryLower) return true;
        
        // Check for contains match
        if (tagLower.includes(queryLower)) return true;
        
        // Check for individual search terms
        return searchTerms.some(term => tagLower.includes(term));
      }).slice(0, 10);

      results.tags = matchingTags.map(tag => ({
        type: 'tag',
        name: tag,
        count: 0, // You could add a count query here if needed
        relevance: calculateTagRelevance(tag, searchQuery, searchTerms)
      }));

      // Sort by relevance
      results.tags.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    }

    // Search collections (if you have a Collection model)
    if (type === 'all' || type === 'collections') {
      try {
        const Collection = require('../models/Collection');
        const collectionQuery = {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: { $in: searchTermRegexes } }
          ]
        };

        const collections = await Collection.find(collectionQuery)
          .populate('author', 'username isAnonymous name')
          .limit(10);

        const transformedCollections = collections.map(collection => ({
          id: collection._id,
          type: 'collection',
          title: collection.title,
          description: collection.description,
          author: collection.author && collection.author.isAnonymous ? 'Anonymous' : (collection.author ? collection.author.username : 'Unknown'),
          tags: collection.tags || [],
          storyCount: collection.stories ? collection.stories.length : 0,
          createdAt: formatTimeAgo(collection.createdAt),
          relevance: calculateCollectionRelevance(collection, searchQuery, searchTerms)
        }));

        // Sort by relevance
        transformedCollections.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        results.collections = transformedCollections;
      } catch (error) {
        // Collection model might not exist yet
      }
    }

    // Calculate total results
    results.totalResults = results.stories.length + results.authors.length + 
                          results.tags.length + results.collections.length;

    // Sort results by relevance if type is 'all'
    if (type === 'all') {
      const allResults = [
        ...results.stories,
        ...results.authors,
        ...results.tags,
        ...results.collections
      ].sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

      // Limit total results
      const limitedResults = allResults.slice(0, parseInt(limit));
      
      // Reorganize by type
      results = {
        stories: limitedResults.filter(r => r.type === 'story'),
        authors: limitedResults.filter(r => r.type === 'author'),
        tags: limitedResults.filter(r => r.type === 'tag'),
        collections: limitedResults.filter(r => r.type === 'collection'),
        totalResults: limitedResults.length
      };
    }

    res.json({
      results,
      query: searchQuery,
      type,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(results.totalResults / parseInt(limit)),
        totalResults: results.totalResults,
        hasMore: skip + results.totalResults < results.totalResults
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Search failed. Please try again.' });
  }
};

// Helper function to calculate relevance score
const calculateRelevance = (story, searchQuery, searchTerms) => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  
  // Title match (highest weight)
  if (story.title.toLowerCase().includes(query)) {
    score += 10;
    if (story.title.toLowerCase().startsWith(query)) {
      score += 5; // Bonus for exact start match
    }
  }
  
  // Tag match (high weight) - check for exact and partial matches
  if (story.tags && story.tags.length > 0) {
    story.tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      
      // Exact tag match (highest weight)
      if (tagLower === query) {
        score += 15;
      }
      // Tag starts with query
      else if (tagLower.startsWith(query)) {
        score += 12;
      }
      // Tag contains query
      else if (tagLower.includes(query)) {
        score += 8;
      }
    });
  }
  
  // Content match (medium weight)
  if (story.content.toLowerCase().includes(query)) {
    score += 3;
  }
  
  // Author match (if not anonymous)
  if (!story.isAnonymous && story.author && 
      story.author.username.toLowerCase().includes(query)) {
    score += 6;
  }
  
  // Search term matches
  searchTerms.forEach(term => {
    if (story.title.toLowerCase().includes(term) ||
        story.content.toLowerCase().includes(term) ||
        (story.tags && story.tags.some(tag => tag.toLowerCase().includes(term)))) {
      score += 2;
    }
  });
  
  return score;
};

// Helper function to calculate author relevance
const calculateAuthorRelevance = (author, searchQuery, searchTerms) => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  
  // Username match
  if (author.username.toLowerCase().includes(query)) {
    score += 6;
  }
  
  // Name match
  if (author.name && author.name.toLowerCase().includes(query)) {
    score += 4;
  }
  
  // Search term matches
  searchTerms.forEach(term => {
    if (author.username.toLowerCase().includes(term) ||
        (author.name && author.name.toLowerCase().includes(term))) {
      score += 2;
    }
  });

  return score;
};

// Helper function to calculate tag relevance
const calculateTagRelevance = (tag, searchQuery, searchTerms) => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  const tagLower = tag.toLowerCase();
  
  // Exact tag match (highest weight)
  if (tagLower === query) {
    score += 15;
  }
  
  // Tag starts with query (high weight)
  else if (tagLower.startsWith(query)) {
    score += 12;
  }
  
  // Tag contains query (medium weight)
  else if (tagLower.includes(query)) {
    score += 8;
  }
  
  // Search term matches
  searchTerms.forEach(term => {
    if (tagLower === term) {
      score += 10; // Exact term match
    } else if (tagLower.startsWith(term)) {
      score += 8; // Starts with term
    } else if (tagLower.includes(term)) {
      score += 4; // Contains term
    }
  });
  
  return score;
};

// Helper function to calculate collection relevance
const calculateCollectionRelevance = (collection, searchQuery, searchTerms) => {
  let score = 0;
  const query = searchQuery.toLowerCase();
  
  // Title match
  if (collection.title.toLowerCase().includes(query)) {
    score += 6;
  }
  
  // Description match
  if (collection.description && collection.description.toLowerCase().includes(query)) {
    score += 4;
  }
  
  // Tag matches
  if (collection.tags && collection.tags.some(tag => tag.toLowerCase().includes(query))) {
    score += 8;
  }
  
  // Search term matches
  searchTerms.forEach(term => {
    if (collection.title.toLowerCase().includes(term) ||
        (collection.description && collection.description.toLowerCase().includes(term)) ||
        (collection.tags && collection.tags.some(tag => tag.toLowerCase().includes(term)))) {
      score += 2;
    }
  });
  
  return score;
};

// React to a story (emoji reaction)
const reactToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id || req.user.id;
    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (!story.reactions) story.reactions = {};
    const current = story.reactions.get(emoji) || [];
    const hasReacted = current.map(id => id.toString()).includes(userId.toString());
    let updated;
    if (hasReacted) {
      updated = current.filter(id => id.toString() !== userId.toString());
    } else {
      updated = [...current, userId];
    }
    story.reactions.set(emoji, updated);
    await story.save();
    res.json({ reactions: Object.fromEntries(story.reactions) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to react to story' });
  }
};

// Toggle bookmark for a story
const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    const isBookmarked = user.bookmarks.includes(id);
    
    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(bookmarkId => bookmarkId.toString() !== id);
      await user.save();
      res.json({ bookmarked: false, message: 'Story removed from bookmarks' });
    } else {
      // Add bookmark
      user.bookmarks.push(id);
      await user.save();
      res.json({ bookmarked: true, message: 'Story added to bookmarks' });
    }
  } catch (err) {
    console.error('Bookmark toggle error:', err);
    res.status(500).json({ message: 'Failed to toggle bookmark' });
  }
};

// Get user's bookmarked stories
const getBookmarkedStories = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const User = require('../models/User');
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: {
        path: 'author',
        select: 'username isAnonymous'
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const bookmarkedStories = user.bookmarks.map(story => {
      const storyObj = story.toObject();
      const isAnonymous = storyObj.isAnonymous || (storyObj.author && storyObj.author.isAnonymous);
      const authorUsername = storyObj.author ? storyObj.author.username : 'Unknown';
      
      return {
        id: storyObj._id,
        title: storyObj.title,
        content: storyObj.content,
        author: isAnonymous ? 'Anonymous' : authorUsername,
        originalAuthor: isAnonymous ? authorUsername : null,
        authorId: storyObj.author ? (storyObj.author._id || storyObj.author.id) : null,
        authorInitials: isAnonymous ? 'A' : (authorUsername.substring(0, 2).toUpperCase()),
        authorColor: isAnonymous ? 'gray' : 'primary',
        tags: storyObj.tags || [],
        likes: storyObj.likedBy?.length || 0,
        likedBy: storyObj.likedBy || [],
        publishedAt: formatTimeAgo(storyObj.createdAt),
        readTime: calculateReadTime(storyObj.content),
        isSeries: false,
        image: null,
        isAnonymous: isAnonymous
      };
    });
    
    res.json({ stories: bookmarkedStories });
  } catch (err) {
    console.error('Get bookmarked stories error:', err);
    res.status(500).json({ message: 'Failed to fetch bookmarked stories' });
  }
};

// Add comment to a story
const addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const storyId = req.params.storyId;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    // Additional validation to prevent dummy/test/sample/placeholder replies
    const trimmedContent = content.trim();
    if (trimmedContent.length < 2) {
      return res.status(400).json({ message: 'Comment must be at least 2 characters long' });
    }
    const dummyPatterns = ['test', 'dummy', 'sample', 'example', 'placeholder'];
    const lowerContent = trimmedContent.toLowerCase();
    if (dummyPatterns.some(pattern => lowerContent.includes(pattern))) {
      return res.status(400).json({ message: 'Please write a meaningful comment' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      likedBy: [],
      replies: [],
      isEdited: false,
      isDeleted: false
    };

    if (parentCommentId) {
      // Validate parentCommentId format
      if (!parentCommentId || typeof parentCommentId !== 'string') {
        return res.status(400).json({ message: 'Invalid parent comment ID' });
      }
      
      // Find parent comment by string comparison
      const parentComment = story.comments.find(comment => comment._id.toString() === parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      
      const newReply = {
        user: userId,
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        likedBy: []
      };
      
      // Add reply to the parent comment
      parentComment.replies.push(newReply);
      
      // Save the story
      const savedStory = await story.save();
      
      // Find the updated story and populate user info
      const updatedStory = await Story.findById(storyId)
        .populate('comments.user', 'username isAnonymous')
        .populate('comments.replies.user', 'username isAnonymous');
      
      // Find the parent comment in the updated story
      const updatedParentComment = updatedStory.comments.find(comment => comment._id.toString() === parentCommentId);
      const addedReply = updatedParentComment.replies[updatedParentComment.replies.length - 1];
      
      const replyResponse = {
        message: 'Reply added successfully',
        reply: {
          _id: addedReply._id,
          content: addedReply.content,
          createdAt: addedReply.createdAt,
          updatedAt: addedReply.updatedAt,
          likes: addedReply.likes,
          likedBy: addedReply.likedBy,
          user: {
            _id: addedReply.user._id,
            username: addedReply.user.isAnonymous ? 'Anonymous' : addedReply.user.username,
            isAnonymous: addedReply.user.isAnonymous
          }
        }
      };
      
      res.json(replyResponse);
    } else {
      // Add new comment
      story.comments.push(newComment);
      await story.save();
      
      // Populate user info for response
      await story.populate('comments.user', 'username isAnonymous');
      const addedComment = story.comments[story.comments.length - 1];
      
      res.json({
        message: 'Comment added successfully',
        comment: {
          _id: addedComment._id,
          content: addedComment.content,
          createdAt: addedComment.createdAt,
          updatedAt: addedComment.updatedAt,
          likes: addedComment.likes,
          likedBy: addedComment.likedBy,
          isEdited: addedComment.isEdited,
          user: {
            _id: addedComment.user._id,
            username: addedComment.user.isAnonymous ? 'Anonymous' : addedComment.user.username,
            isAnonymous: addedComment.user.isAnonymous
          },
          replies: []
        }
      });
    }
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { storyId, commentId, replyId } = req.params;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (replyId) {
      // Update reply
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      if (reply.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only edit your own replies' });
      }

      reply.content = content.trim();
      reply.updatedAt = new Date();
      await story.save();

      res.json({ message: 'Reply updated successfully' });
    } else {
      // Update comment
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
      }

      comment.content = content.trim();
      comment.updatedAt = new Date();
      comment.isEdited = true;
      await story.save();

      res.json({ message: 'Comment updated successfully' });
    }
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { storyId, commentId, replyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (replyId) {
      // Delete reply
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Allow deletion if user is reply author or story author
      if (reply.user.toString() !== userId.toString() && story.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only delete your own replies' });
      }

      // Remove the reply from the replies array
      const originalReplyCount = comment.replies.length;
      comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
      const newReplyCount = comment.replies.length;
      
      await story.save();

      res.json({ message: 'Reply deleted successfully' });
    } else {
      // Delete comment
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Allow deletion if user is comment author or story author
      if (comment.user.toString() !== userId.toString() && story.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      // Remove the comment from the comments array
      story.comments = story.comments.filter(c => c._id.toString() !== commentId);
      await story.save();

      res.json({ message: 'Comment deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Like/unlike comment
const toggleCommentLike = async (req, res) => {
  try {
    const { storyId, commentId, replyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (replyId) {
      // Like/unlike reply
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const reply = comment.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      const likeIndex = reply.likedBy.indexOf(userId);
      if (likeIndex > -1) {
        reply.likedBy.splice(likeIndex, 1);
      } else {
        reply.likedBy.push(userId);
      }
      reply.likes = reply.likedBy.length;
      await story.save();

      res.json({ 
        likes: reply.likes,
        isLiked: reply.likedBy.includes(userId)
      });
    } else {
      // Like/unlike comment
      const comment = story.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      const likeIndex = comment.likedBy.indexOf(userId);
      if (likeIndex > -1) {
        comment.likedBy.splice(likeIndex, 1);
      } else {
        comment.likedBy.push(userId);
      }
      comment.likes = comment.likedBy.length;
      await story.save();

      res.json({ 
        likes: comment.likes,
        isLiked: comment.likedBy.includes(userId)
      });
    }
  } catch (err) {
    console.error('Error toggling comment like:', err);
    res.status(500).json({ message: 'Failed to toggle comment like' });
  }
};

// Get tag counts (number of stories per tag)
const getTagCounts = async (req, res) => {
  try {
    // Aggregate tag counts from stories, excluding stories in collections
    const tagCounts = await Story.aggregate([
      // First, filter out stories that are in collections
      { $match: { collection: { $exists: false } } },
      { $unwind: "$tags" },
      // Filter out null, undefined, or empty tags
      { $match: { tags: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);
    
    // Format as { tag, count } and filter out any remaining invalid tags
    const result = tagCounts
      .filter(tc => tc._id && tc._id.trim() !== '')
      .map(tc => ({ 
        tag: tc._id.trim(), 
        count: tc.count 
      }));
    
    res.json({ tagCounts: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tag counts' });
  }
};

// Get all stories by the current user
const getUserStories = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all stories by the user (including those in collections)
    const stories = await Story.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username isAnonymous')
      .populate('collection', 'title description');
    
    // Transform stories for frontend
    const transformedStories = stories.map(story => {
      const storyObj = story.toObject();
      const isAnonymous = storyObj.isAnonymous || (storyObj.author && storyObj.author.isAnonymous);
      const authorUsername = storyObj.author ? storyObj.author.username : 'Unknown';
      const readTime = calculateReadTime(storyObj.content);
      
      return {
        id: storyObj._id,
        title: storyObj.title,
        content: storyObj.content,
        author: isAnonymous ? 'Anonymous' : authorUsername,
        originalAuthor: isAnonymous ? authorUsername : null,
        authorId: storyObj.author ? (storyObj.author._id || storyObj.author.id) : null,
        authorInitials: isAnonymous ? 'A' : (authorUsername.substring(0, 2).toUpperCase()),
        authorColor: isAnonymous ? 'gray' : 'primary',
        tags: storyObj.tags || [],
        likes: storyObj.likedBy?.length || 0,
        likedBy: storyObj.likedBy || [],
        publishedAt: formatTimeAgo(storyObj.createdAt),
        readTime,
        readTimeText: `${readTime} min read`,
        isSeries: false,
        image: null,
        isAnonymous: isAnonymous,
        isUserStory: true,
        collection: storyObj.collection ? {
          id: storyObj.collection._id,
          title: storyObj.collection.title,
          description: storyObj.collection.description
        } : null,
        views: storyObj.views || 0
      };
    });
    
    res.json({
      stories: transformedStories,
      totalStories: transformedStories.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user stories' });
  }
};



module.exports = {
  createStory,
  getStories,
  getStoryById,
  deleteStory,
  toggleLike,
  formatTimeAgo,
  calculateReadTime,
  getAllTags,
  searchStories,
  reactToStory,
  toggleBookmark,
  getBookmarkedStories,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getTagCounts,
  getUserStories
};
