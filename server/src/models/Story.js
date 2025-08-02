const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAnonymous: { type: Boolean, default: false },
  tags: [String],
  storyType: { type: String, enum: [
    'Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'Mystery', 
    'Romance', 'Sci-Fi', 'Fantasy', 'Horror', 'Adventure', 'Biography',
    'Thriller', 'Comedy', 'Tragedy', 'Historical Fiction', 'Contemporary',
    'Young Adult', 'Children', 'Literary Fiction', 'Commercial Fiction',
    'Paranormal', 'Supernatural', 'Urban Fantasy', 'Epic Fantasy',
    'Space Opera', 'Cyberpunk', 'Steampunk', 'Dystopian', 'Utopian',
    'Crime', 'Detective', 'Legal Thriller', 'Medical Thriller',
    'Psychological Thriller', 'Political Thriller', 'Military Fiction',
    'Western', 'War', 'Post-Apocalyptic', 'Alternate History',
    'Magical Realism', 'Fairy Tale', 'Fable', 'Legend', 'Mythology',
    'Folklore', 'Gothic', 'Dark Fantasy', 'Light Fantasy', 'Sword & Sorcery',
    'High Fantasy', 'Low Fantasy', 'Contemporary Fantasy', 'Historical Fantasy',
    'Science Fantasy', 'Hard Science Fiction', 'Soft Science Fiction',
    'Time Travel', 'Parallel Worlds', 'Alien Contact', 'First Contact',
    'Space Exploration', 'Colonization', 'Artificial Intelligence',
    'Virtual Reality', 'Genetic Engineering', 'Climate Fiction',
    'Eco-Fiction', 'Social Commentary', 'Satire', 'Parody', 'Absurdist',
    'Experimental', 'Stream of Consciousness', 'Metafiction', 'Pastiche',
    'Slice of Life', 'Coming of Age', 'Family Drama', 'Domestic Fiction',
    'Women\'s Fiction', 'Men\'s Fiction', 'LGBTQ+ Fiction', 'Multicultural',
    'Immigration', 'Refugee', 'Cultural Identity', 'Social Justice',
    'Activism', 'Philosophical', 'Existential', 'Spiritual', 'Religious',
    'Inspirational', 'Self-Help', 'Memoir', 'Autobiography', 'Travel',
    'Food & Cooking', 'Sports', 'Music', 'Art', 'Fashion', 'Business',
    'Technology', 'Education', 'Health & Wellness', 'Mental Health',
    'Addiction & Recovery', 'Grief & Loss', 'Love & Relationships',
    'Friendship', 'Family', 'Parenting', 'Marriage', 'Divorce',
    'Workplace', 'Career', 'Academic', 'Research', 'Journalism',
    'True Crime', 'Documentary', 'Diary', 'Journal', 'Letter', 'Essay', 
    'Article', 'Review', 'Criticism', 'Analysis', 'Commentary', 'Opinion', 
    'Editorial', 'Short Story', 'Novella', 'Novel', 'Series', 'Anthology',
    'Collection', 'Compilation', 'Other'
  ], default: 'Fiction' },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: {
    type: Map,
    of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: {}
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Create text index for better search performance
StorySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 8,
    content: 3
  }
});

module.exports = mongoose.model('Story', StorySchema);