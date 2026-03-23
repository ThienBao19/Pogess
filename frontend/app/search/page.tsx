'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchArticles } from '@/lib/api';
import ArticleCard from '@/components/articles/ArticleCard';
import { Article } from '@/types';
import { Search } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setSearched(true);
    searchArticles(q)
      .then(res => setArticles(res.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="section-divider mb-6">
        <h1 className="font-serif font-bold" style={{ fontSize: '1.5rem', color: 'var(--color-ink)' }}>
          {q ? (
            <>Search results for: <em>"{q}"</em></>
          ) : (
            'Search'
          )}
        </h1>
      </div>

      {loading && (
        <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
          <Search size={32} className="mx-auto mb-3 animate-pulse" />
          <p>Searching…</p>
        </div>
      )}

      {!loading && searched && articles.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
          <p className="font-serif text-xl">No results found for "{q}".</p>
          <p className="text-sm mt-2">Try a different search term.</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            {articles.length} result{articles.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
