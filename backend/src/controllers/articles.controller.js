const supabase = require('../config/supabase');

// ── List articles (paginated, optional category filter) ───────
async function getArticles(req, res, next) {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('articles')
      .select(`
        id, title, slug, description, cover_image, author,
        published_at, is_featured,
        categories(id, name, slug)
      `, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(from, to);

    // Supabase .eq on embedded tables doesn't filter parent rows,
    // so look up category_id by slug first
    if (category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) {
        query = query.eq('category_id', cat.id);
      } else {
        // Category not found → return empty result
        return res.json({ data: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 } });
      }
    }

    const { data, error, count } = await query;
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

// ── Get single article by slug ───────────────────────────────
async function getArticleBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Article not found' });

    // Get like count
    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', data.id);

    return res.json({ ...data, likes_count: likesCount });
  } catch (err) {
    next(err);
  }
}

// ── Get featured articles ────────────────────────────────────
async function getFeaturedArticles(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`id, title, slug, description, cover_image, author, published_at, categories(id, name, slug)`)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Full-text search ─────────────────────────────────────────
async function searchArticles(req, res, next) {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query (q) is required' });

    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await supabase
      .from('articles')
      .select(`id, title, slug, description, cover_image, author, published_at, categories(id, name, slug)`, { count: 'exact' })
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return res.json({
      data,
      query: q,
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

module.exports = { getArticles, getArticleBySlug, getFeaturedArticles, searchArticles };
