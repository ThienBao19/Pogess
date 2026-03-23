const supabase = require('../../config/supabase');
const slugify = require('slugify');

// ── List all articles (admin) ─────────────────────────────────
async function listArticles(req, res, next) {
  try {
    const { page = 1, limit = 20, category, search, source } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('articles')
      .select(`id, title, slug, description, content, cover_image, author, is_featured, published_at, source, categories(id, name, slug)`, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(from, to);

    if (category) query = query.eq('category_id', category);
    if (source) query = query.eq('source', source);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── Create article ────────────────────────────────────────────
async function createArticle(req, res, next) {
  try {
    const { title, description, content, cover_image, author, category_id, is_featured } = req.body;
    if (!title || !category_id) {
      return res.status(400).json({ error: 'title and category_id are required' });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title, slug, description, content, cover_image,
        author: author || 'Admin',
        category_id,
        is_featured: is_featured || false,
        source: 'admin',
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Update article ────────────────────────────────────────────
async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.title) {
      updates.slug = slugify(updates.title, { lower: true, strict: true });
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Delete article ────────────────────────────────────────────
async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listArticles, createArticle, updateArticle, deleteArticle };
