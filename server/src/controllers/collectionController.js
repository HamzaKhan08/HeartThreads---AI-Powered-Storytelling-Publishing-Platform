const Collection = require('../models/Collection');

exports.createCollection = async (req, res) => {
  const { title, description, stories, isAnonymous, tags, coverImage } = req.body;
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Authentication required. User not found.' });
  }
  // Validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required and must be a non-empty string.' });
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Description is required and must be a non-empty string.' });
  }
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ success: false, message: 'Tags must be an array.' });
  }
  try {
    const collection = await Collection.create({
      title: title.trim(),
      description: description.trim(),
      stories,
      isAnonymous: isAnonymous || req.user.isAnonymous,
      author: req.user._id,
      tags: tags || [],
      coverImage: coverImage || ''
    });
    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) io.emit('collectionCreated', collection);
    res.json(collection);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create collection.' });
  }
};

exports.getCollections = async (req, res) => {
  try {
    const { author, likedBy, limit = 100, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by author
    if (author) {
      query.author = author;
    }
    
    // Filter by likedBy (collections liked by a specific user)
    if (likedBy) {
      query.likedBy = likedBy;
    }

    // Determine sort field and order
    let sortField = 'createdAt';
    let sortOrder = order === 'asc' ? 1 : -1;
    if (sortBy === 'likes') sortField = 'likes';
    if (sortBy === 'title') sortField = 'title';

    const collections = await Collection.find(query)
      .sort({ [sortField]: sortOrder })
      .limit(parseInt(limit))
      .populate('author', 'username isAnonymous name')
      .populate('stories');
    
    const transformedCollections = collections.map(col => {
      const colObj = col.toObject();
      return {
        ...colObj,
        author: colObj.isAnonymous || colObj.author.isAnonymous ? 'Anonymous' : colObj.author.username,
        likes: colObj.likedBy?.length || 0
      };
    });
    
    res.json({ collections: transformedCollections });
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ message: 'Failed to fetch collections' });
  }
};

exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('author', 'username isAnonymous name')
      .populate('stories');
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const colObj = collection.toObject();
    res.json({
      ...colObj,
      author: colObj.isAnonymous || colObj.author.isAnonymous ? 'Anonymous' : colObj.author.username,
      likes: colObj.likedBy?.length || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch collection' });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if user is the author of the collection
    if (collection.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own collections' });
    }
    
    await Collection.findByIdAndDelete(req.params.id);
    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) io.emit('collectionDeleted', { id: req.params.id });
    res.json({ message: 'Collection deleted successfully' });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ message: 'Failed to delete collection' });
  }
};