const express = require('express');
const router = express.Router();
const { toggleLike, getLikeCount, checkLike } = require('../controllers/likes.controller');
const authenticate = require('../middleware/authenticate');

// GET /api/likes/:articleId/count
router.get('/:articleId/count', getLikeCount);

// GET /api/likes/:articleId/check  (requires auth)
router.get('/:articleId/check', authenticate, checkLike);

// POST /api/likes/:articleId  (toggle)
router.post('/:articleId', authenticate, toggleLike);

module.exports = router;
