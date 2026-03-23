const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  getFeaturedArticles,
  searchArticles,
} = require('../controllers/articles.controller');

// GET /api/articles?category=slug&page=1&limit=12
router.get('/', getArticles);

// GET /api/articles/featured
router.get('/featured', getFeaturedArticles);

// GET /api/articles/:slug
router.get('/:slug', getArticleBySlug);

module.exports = router;
