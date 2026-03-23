const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
} = require('../controllers/categories.controller');

// GET /api/categories — list all categories
router.get('/', getCategories);

// GET /api/categories/:slug — single category by slug
router.get('/:slug', getCategoryBySlug);

module.exports = router;
