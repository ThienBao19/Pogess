const supabase = require('../config/supabase');

// ── Get comments for an article ──────────────────────────────
async function getComments(req, res, next) {
  try {
    const { articleId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select(`id, content, created_at, users(id, name, avatar_url)`)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Add a comment ─────────────────────────────────────────────
async function addComment(req, res, next) {
  try {
    const { article_id, content } = req.body;
    if (!article_id || !content) {
      return res.status(400).json({ error: 'article_id and content are required' });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ article_id, content, user_id: req.user.id })
      .select(`id, content, created_at, users(id, name, avatar_url)`)
      .single();

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Delete own comment ────────────────────────────────────────
async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;

    // Check ownership (unless admin)
    if (req.user.role !== 'admin') {
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', id)
        .single();
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getComments, addComment, deleteComment };
