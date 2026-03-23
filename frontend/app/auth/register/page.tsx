'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push('/auth/login?registered=1');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed. Please try again.');
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
            Create an Account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            Join The Daily Press community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm py-2 px-3" style={{ backgroundColor: '#fef2f2', color: 'var(--color-accent)', border: '1px solid #fecaca' }}>
              {error}
            </p>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-ink-muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--color-link)' }} className="font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
