const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access + refresh tokens for a user payload.
 */
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

/**
 * Set auth cookies on the response.
 */
function setAuthCookies(res, accessToken, refreshToken) {
  const isSecure = process.env.COOKIE_SECURE === 'true';
  const sameSiteMode = isSecure ? 'none' : 'lax';

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteMode,
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteMode,
    path: '/api/auth/refresh', // only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

// ── Register ──────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(AppError.badRequest('Name, email and password are required'));
    }

    if (password.length < 6) {
      return next(AppError.badRequest('Password must be at least 6 characters'));
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return next(AppError.conflict('Email already registered'));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, role: 'user' })
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;

    // Auto-login: issue tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: 'Registration successful',
      user,
    });
  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(AppError.badRequest('Email and password are required'));
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, password, is_locked')
      .eq('email', email)
      .single();

    if (error || !user) {
      return next(AppError.unauthorized('Invalid credentials'));
    }
    if (user.is_locked) {
      return next(AppError.forbidden('Account is locked. Contact support.'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(AppError.unauthorized('Invalid credentials'));
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// ── Refresh Token ─────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return next(AppError.unauthorized('No refresh token provided'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(AppError.unauthorized('Invalid or expired refresh token'));
    }

    if (decoded.type !== 'refresh') {
      return next(AppError.unauthorized('Invalid token type'));
    }

    // Verify user still exists and is not locked
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, is_locked')
      .eq('id', decoded.id)
      .single();

    if (!user) return next(AppError.unauthorized('User no longer exists'));
    if (user.is_locked) return next(AppError.forbidden('Account is locked'));

    const payload = { id: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefresh } = generateTokens(payload);
    setAuthCookies(res, accessToken, newRefresh);

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
}

// ── Logout ────────────────────────────────────────────────────
function logout(req, res) {
  const isSecure = process.env.COOKIE_SECURE === 'true';
  const sameSiteMode = isSecure ? 'none' : 'lax';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteMode,
  });
  
  res.clearCookie('refreshToken', { 
    path: '/api/auth/refresh',
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteMode,
  });
  
  return res.json({ message: 'Logged out successfully' });
}

// ── Get current user ──────────────────────────────────────────
async function me(req, res, next) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return next(AppError.notFound('User not found'));
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, refreshToken };
