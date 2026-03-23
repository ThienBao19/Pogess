const express = require('express');
const router = express.Router();
const { toggleBookmark, getBookmarks, checkBookmark } = require('../controllers/bookmarks.controller');
const authenticate = require('../middleware/authenticate');

// GET /api/bookmarks  (user's bookmarks)
router.get('/', authenticate, getBookmarks);

// GET /api/bookmarks/:articleId/check
router.get('/:articleId/check', authenticate, checkBookmark);

// POST /api/bookmarks/:articleId  (toggle)
router.post('/:articleId', authenticate, toggleBookmark);

module.exports = router;
