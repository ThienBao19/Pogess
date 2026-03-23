const supabase = require('../config/supabase');
const slugify = require('slugify');
const AppError = require('../utils/AppError');

// ── List all categories ───────────────────────────────────────
async function getCategories(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Get single category by slug ───────────────────────────────
async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return next(AppError.notFound('Category not found'));
    }
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Create category (admin) ──────────────────────────────────
async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return next(AppError.badRequest('name is required'));

    const slug = slugify(name, { lower: true, strict: true });
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, description })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Update category (admin) ──────────────────────────────────
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updates = {};

    if (description !== undefined) updates.description = description;
    if (name) {
      updates.name = name;
      updates.slug = slugify(name, { lower: true, strict: true });
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return next(AppError.notFound('Category not found'));
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ── Delete category (admin) ──────────────────────────────────
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
