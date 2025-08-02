const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrict = require('../middleware/restrict');
const { createBook, getBooks, getBookById, likeBook } = require('../controllers/bookController');

router.get('/', restrict, getBooks);
router.post('/', auth, createBook);
router.post('/:bookId/like', auth, likeBook);
router.get('/:id', restrict, getBookById);

module.exports = router;
