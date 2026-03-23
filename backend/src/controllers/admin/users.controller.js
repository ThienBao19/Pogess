const supabase = require('../../config/supabase');
const AppError = require('../../utils/AppError');

// ── Get all users ─────────────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('users')
      .select('id, name, email, role, is_locked, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
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

// ── Change user role ──────────────────────────────────────────
async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return next(AppError.badRequest('role must be "user" or "admin"'));
    }

    // Prevent self-demotion
    if (id === req.user.id) {
      return next(AppError.badRequest('Cannot change your own role'));
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    if (!data) return next(AppError.notFound('User not found'));

    return res.json({ data, message: `User role updated to ${role}` });
  } catch (err) {
    next(err);
  }
}

// ── Lock / Unlock user ────────────────────────────────────────
async function toggleLock(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent self-lock
    if (id === req.user.id) {
      return next(AppError.badRequest('Cannot lock your own account'));
    }

    const { data: user } = await supabase
      .from('users').select('is_locked').eq('id', id).single();

    if (!user) return next(AppError.notFound('User not found'));

    const { data, error } = await supabase
      .from('users')
      .update({ is_locked: !user.is_locked })
      .eq('id', id)
      .select('id, name, is_locked')
      .single();

    if (error) throw error;
    return res.json({ data, message: data.is_locked ? 'User locked' : 'User unlocked' });
  } catch (err) {
    next(err);
  }
}

// ── Delete user ───────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return next(AppError.badRequest('Cannot delete your own account'));
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, changeRole, toggleLock, deleteUser };
