require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const authRoutes       = require('./routes/auth.routes');
const articleRoutes    = require('./routes/articles.routes');
const categoryRoutes   = require('./routes/categories.routes');
const commentRoutes    = require('./routes/comments.routes');
const likeRoutes       = require('./routes/likes.routes');
const bookmarkRoutes   = require('./routes/bookmarks.routes');
const nytRoutes        = require('./routes/nyt.routes');
const adminRoutes      = require('./routes/admin/admin.routes');
const errorHandler     = require('./middleware/errorHandler');
const csrfProtection   = require('./middleware/csrfProtection');
const { syncAllSections } = require('./services/nytSync.service');
const { purgeExpired }    = require('./services/nytCache.service');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security ──────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, // allow cookies
}));

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfProtection);  // validate X-Requested-With on mutating requests

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  uptime: process.uptime(),
}));

// ── Search (standalone route) ─────────────────────────────────
const { searchArticles } = require('./controllers/articles.controller');
app.get('/api/search', searchArticles);

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/articles',   articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments',   commentRoutes);
app.use('/api/likes',      likeRoutes);
app.use('/api/bookmarks',  bookmarkRoutes);
app.use('/api/nyt',        nytRoutes);
app.use('/api/admin',      adminRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── NYT Cron: configurable sync interval ──────────────────────
const syncInterval = process.env.NYT_SYNC_INTERVAL || '*/15 * * * *';
cron.schedule(syncInterval, async () => {
  console.log('[CRON] Triggering NYT sync + cache purge...');
  await Promise.all([
    syncAllSections(),
    purgeExpired(),
  ]);
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  // Run initial sync on startup (non-blocking)
  syncAllSections().catch(err => console.error('Initial NYT sync failed:', err.message));
});

module.exports = app;
