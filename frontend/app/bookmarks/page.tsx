'use client';

import { useEffect, useState } from 'react';
import { getBookmarks } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ArticleCard from '@/components/articles/ArticleCard';
import { Article } from '@/types';
import { Bookmark } from 'lucide-react';

function BookmarksContent() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      getBookmarks()
        .then(res => {
          const arts = (res.data || []).map((b: { articles: Article }) => b.articles).filter(Boolean);
          setArticles(arts);
        })
        .catch(() => setArticles([]))
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--color-ink-muted)' }}>
        <Bookmark size={32} className="mx-auto mb-3 animate-pulse" />
        <p>Loading bookmarks…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="section-divider mb-6">
        <h1 className="font-serif font-bold flex items-center gap-2" style={{ fontSize: '1.75rem', color: 'var(--color-ink)' }}>
          <Bookmark size={22} /> My Bookmarks
        </h1>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-serif text-xl">No bookmarks yet.</p>
          <p className="text-sm mt-2">Save articles by clicking the bookmark button on any article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <ProtectedRoute>
      <BookmarksContent />
    </ProtectedRoute>
  );
}
