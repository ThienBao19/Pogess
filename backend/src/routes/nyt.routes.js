const express = require('express');
const router = express.Router();
const nytCachedService = require('../services/nytCache.service');

// ── Search NYT articles ───────────────────────────────────────
// GET /api/nyt/search?q=term&page=0
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = 0 } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query (q) is required' });

    const result = await nytCachedService.searchArticles(q, parseInt(page));
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── Top Stories by section ────────────────────────────────────
// GET /api/nyt/top/:section
router.get('/top/:section', async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['home', 'world', 'technology', 'sports', 'arts', 'science', 'business', 'health'];
    if (!validSections.includes(section)) {
      return res.status(400).json({
        error: `Invalid section. Choose from: ${validSections.join(', ')}`,
      });
    }

    const articles = await nytCachedService.fetchTopStories(section);
    return res.json({ section, count: articles.length, data: articles });
  } catch (err) {
    next(err);
  }
});

// ── Most Popular ──────────────────────────────────────────────
// GET /api/nyt/popular?type=viewed&period=1
router.get('/popular', async (req, res, next) => {
  try {
    const { type = 'viewed', period = 1 } = req.query;
    const validTypes = ['viewed', 'shared', 'emailed'];
    const validPeriods = [1, 7, 30];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Choose from: ${validTypes.join(', ')}` });
    }
    if (!validPeriods.includes(parseInt(period))) {
      return res.status(400).json({ error: `Invalid period. Choose from: ${validPeriods.join(', ')}` });
    }

    const data = await nytCachedService.fetchMostPopular(type, parseInt(period));
    return res.json({ type, period: parseInt(period), count: data.length, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
