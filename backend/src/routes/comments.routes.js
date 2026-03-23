const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/comments.controller');
const authenticate = require('../middleware/authenticate');

// GET /api/comments/:articleId
router.get('/:articleId', getComments);

// POST /api/comments
router.post('/', authenticate, addComment);

// DELETE /api/comments/:id
router.delete('/:id', authenticate, deleteComment);

module.exports = router;
