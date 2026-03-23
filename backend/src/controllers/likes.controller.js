const supabase = require('../config/supabase');

// ── Toggle like ───────────────────────────────────────────────
async function toggleLike(req, res, next) {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();

    if (existing) {
      await supabase.from('likes').delete()
        .eq('user_id', userId).eq('article_id', articleId);
      return res.json({ liked: false });
    } else {
      await supabase.from('likes').insert({ user_id: userId, article_id: articleId });
      return res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
}

// ── Get like count for an article ─────────────────────────────
async function getLikeCount(req, res, next) {
  try {
    const { articleId } = req.params;
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;
    return res.json({ article_id: articleId, likes_count: count });
  } catch (err) {
    next(err);
  }
}

// ── Check if user liked an article ───────────────────────────
async function checkLike(req, res, next) {
  try {
    const { articleId } = req.params;
    const { data } = await supabase
      .from('likes')
      .select('user_id')
      .eq('user_id', req.user.id)
      .eq('article_id', articleId)
      .single();

    return res.json({ liked: !!data });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleLike, getLikeCount, checkLike };
