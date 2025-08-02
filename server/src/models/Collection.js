const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  tags: [String],
  isPublic: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coverImage: { type: String, default: '' },
}, { timestamps: true });

// Create text index for better search performance
CollectionSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 8,
    description: 5
  }
});

module.exports = mongoose.model('Collection', CollectionSchema);