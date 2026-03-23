'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Bookmark, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { name: 'Current Affairs', slug: 'current-affairs' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Entertainment', slug: 'entertainment' },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  return (
    <header style={{ backgroundColor: 'var(--color-paper)', borderBottom: '1px solid var(--color-border)' }}>
      {/* Top bar */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>{today}</span>
          <div className="flex items-center gap-3">
            <button
              id="header-search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-ink-light)' }}
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="header-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-ink)' }}
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{user.name}</span>
                  <ChevronDown size={12} />
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 bg-white border shadow-lg z-50"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50 font-medium"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/bookmarks"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: 'var(--color-ink)' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Bookmark size={13} /> My Bookmarks
                    </Link>
                    <hr style={{ borderColor: 'var(--color-border)' }} />
                    <button
                      id="header-logout-btn"
                      onClick={async () => { await signOut(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                      style={{ color: 'var(--color-ink-muted)' }}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium hover:opacity-70"
                  style={{ color: 'var(--color-ink)' }}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary text-xs px-3 py-1.5"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-b py-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-paper-warm)' }}>
          <div className="max-w-3xl mx-auto px-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search articles by title or category…"
                className="input flex-1"
                id="header-search-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:opacity-70">
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Masthead */}
      <div className="text-center py-6 px-4">
        <Link href="/" className="inline-block">
          <h1
            className="article-headline select-none"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '-0.02em', color: 'var(--color-ink)' }}
          >
            The Daily Press
          </h1>
        </Link>
        <div
          className="mx-auto mt-2"
          style={{ height: '1px', maxWidth: '600px', background: 'var(--color-ink)' }}
        />
      </div>

      {/* Category nav */}
      <nav style={{ borderTop: '3px solid var(--color-ink)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                style={{ letterSpacing: '0.06em', color: 'var(--color-ink)', fontSize: '0.75rem' }}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile nav toggle */}
          <div className="flex md:hidden items-center justify-between py-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-ink-muted)' }}>Sections</span>
            <button id="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {menuOpen && (
            <div className="md:hidden pb-2">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="block px-2 py-2 text-sm font-semibold uppercase"
                  style={{ color: 'var(--color-ink)', letterSpacing: '0.06em', fontSize: '0.75rem' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
