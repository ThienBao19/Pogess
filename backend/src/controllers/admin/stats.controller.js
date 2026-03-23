const supabase = require('../../config/supabase');
const { getCacheStats } = require('../../services/nytCache.service');

// ── Dashboard statistics ──────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [
      { count: totalArticles },
      { count: totalUsers },
      { count: totalComments },
      { count: totalLikes },
      { count: totalBookmarks },
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*',    { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*',    { count: 'exact', head: true }),
      supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
    ]);

    // Recent articles (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo);

    // NYT cache stats
    const nytCache = await getCacheStats();

    return res.json({
      totalArticles,
      totalUsers,
      totalComments,
      totalLikes,
      totalBookmarks,
      recentArticles,
      nytCache,
    });
  } catch (err) {
    next(err);
  }
}

// ── Get all comments (admin) ──────────────────────────────────
async function listComments(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await supabase
      .from('comments')
      .select(`id, content, created_at, users(id, name, email), articles(id, title, slug)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Delete any comment (admin) ────────────────────────────────
async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  listComments,
  deleteComment,
};
