const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const adminArticles = require('../../controllers/admin/articles.controller');
const adminUsers = require('../../controllers/admin/users.controller');
const adminStats = require('../../controllers/admin/stats.controller');
const categories = require('../../controllers/categories.controller');
const { syncAllSections } = require('../../services/nytSync.service');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', adminStats.getStats);

// ── Articles ──────────────────────────────────────────────────
router.get('/articles',            adminArticles.listArticles);
router.post('/articles',           adminArticles.createArticle);
router.put('/articles/:id',        adminArticles.updateArticle);
router.delete('/articles/:id',     adminArticles.deleteArticle);

// ── Manual NYT sync trigger ──────────────────────────────────
router.post('/articles/sync-nyt', async (req, res, next) => {
  try {
    await syncAllSections();
    res.json({ message: 'NYT sync completed' });
  } catch (err) { next(err); }
});

// ── Categories (admin CRUD) ──────────────────────────────────
router.get('/categories',          categories.getCategories);
router.post('/categories',         categories.createCategory);
router.put('/categories/:id',      categories.updateCategory);
router.delete('/categories/:id',   categories.deleteCategory);

// ── Users ─────────────────────────────────────────────────────
router.get('/users',               adminUsers.listUsers);
router.put('/users/:id/role',      adminUsers.changeRole);
router.put('/users/:id/lock',      adminUsers.toggleLock);
router.delete('/users/:id',        adminUsers.deleteUser);

// ── Comments moderation ───────────────────────────────────────
router.get('/comments',            adminStats.listComments);
router.delete('/comments/:id',     adminStats.deleteComment);

module.exports = router;
