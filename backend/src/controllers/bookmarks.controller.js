const supabase = require('../config/supabase');

// ── Toggle bookmark ───────────────────────────────────────────
async function toggleBookmark(req, res, next) {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();

    if (existing) {
      await supabase.from('bookmarks').delete()
        .eq('user_id', userId).eq('article_id', articleId);
      return res.json({ bookmarked: false });
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, article_id: articleId });
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    next(err);
  }
}

// ── Get user bookmarks ────────────────────────────────────────
async function getBookmarks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        created_at,
        articles(id, title, slug, description, cover_image, author, published_at,
          categories(id, name, slug))
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Check if user bookmarked an article ───────────────────────
async function checkBookmark(req, res, next) {
  try {
    const { articleId } = req.params;
    const { data } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('user_id', req.user.id)
      .eq('article_id', articleId)
      .single();

    return res.json({ bookmarked: !!data });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleBookmark, getBookmarks, checkBookmark };
