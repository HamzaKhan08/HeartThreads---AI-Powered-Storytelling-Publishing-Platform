const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const restrict = require('../middleware/restrict');
const { createCollection, getCollections, deleteCollection, getCollectionById } = require('../controllers/collectionController');

router.get('/', getCollections);
router.post('/', auth, createCollection);
router.delete('/:id', auth, deleteCollection);
router.get('/:id', getCollectionById);

module.exports = router;
