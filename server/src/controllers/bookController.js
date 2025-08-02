const Book = require('../models/Book');

exports.createBook = async (req, res) => {
  const { title, chapters, isAnonymous } = req.body;
  try {
    const book = await Book.create({
      title,
      chapters,
      isAnonymous: isAnonymous || req.user.isAnonymous,
      author: req.user._id
    });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBooks = async (req, res) => {
  const limit = req.user ? 100 : 3;
  const books = await Book.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'username isAnonymous');
  
  const userId = req.user?._id;
  
  res.json(books.map(book => ({
    ...book.toObject(),
    author: book.isAnonymous || book.author.isAnonymous ? 'Anonymous' : book.author.username,
    likes: book.likedBy?.length || 0,
    likedByCurrentUser: userId ? book.likedBy.includes(userId) : false
  })));
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author', 'username isAnonymous');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const userId = req.user?._id;
    
    res.json({
      ...book.toObject(),
      author: book.isAnonymous || book.author.isAnonymous ? 'Anonymous' : book.author.username,
      likes: book.likedBy?.length || 0,
      likedByCurrentUser: userId ? book.likedBy.includes(userId) : false
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch book' });
  }
};

exports.likeBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id || req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const isLiked = book.likedBy.includes(userId);
    const io = req.app.get('io');
    let updatedBook;

    if (isLiked) {
      // Unlike
      updatedBook = await Book.findByIdAndUpdate(bookId, {
        $pull: { likedBy: userId }
      }, { new: true });
      if (io) io.emit('bookUnliked', {
        bookId,
        likes: updatedBook.likedBy.length,
        likedBy: updatedBook.likedBy,
        userId
      });
      res.json({ message: 'Book unliked', liked: false, likes: updatedBook.likedBy.length, likedBy: updatedBook.likedBy });
    } else {
      // Like
      updatedBook = await Book.findByIdAndUpdate(bookId, {
        $addToSet: { likedBy: userId }
      }, { new: true });
      if (io) io.emit('bookLiked', {
        bookId,
        likes: updatedBook.likedBy.length,
        likedBy: updatedBook.likedBy,
        userId
      });
      res.json({ message: 'Book liked', liked: true, likes: updatedBook.likedBy.length, likedBy: updatedBook.likedBy });
    }
  } catch (error) {
    console.error('Error in likeBook:', error);
    res.status(500).json({ message: 'Failed to like/unlike book' });
  }
};
