'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      setUser(res.user);
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--color-paper-warm)' }}
    >
      <div
        className="w-full max-w-md bg-white p-8"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="text-center mb-8">
          <h1 className="article-headline" style={{ fontSize: '1.75rem', color: 'var(--color-ink)' }}>
            Welcome Back
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            Sign in to The Daily Press
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm py-2 px-3" style={{ backgroundColor: '#fef2f2', color: 'var(--color-accent)', border: '1px solid #fecaca' }}>
              {error}
            </p>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-ink-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--color-link)' }} className="font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
