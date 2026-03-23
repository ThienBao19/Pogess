import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';
import { formatRelativeDate, truncate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'minimal';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = article.nyt_url && article.source === 'nyt'
    ? `/articles/${article.slug}`
    : `/articles/${article.slug}`;

  if (variant === 'horizontal') {
    return (
      <Link href={href} className="article-card flex gap-3 group">
        {article.cover_image && (
          <div className="flex-shrink-0 w-20 h-20 relative overflow-hidden">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.categories && (
            <span className="category-badge">{article.categories.name}</span>
          )}
          <h3
            className="font-serif font-bold leading-snug group-hover:underline"
            style={{ fontSize: '0.9rem', color: 'var(--color-ink)', marginTop: '0.15rem' }}
          >
            {truncate(article.title, 90)}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: '0.25rem' }}>
            {formatRelativeDate(article.published_at)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'minimal') {
    return (
      <Link href={href} className="article-card block group py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {article.categories && (
          <span className="category-badge">{article.categories.name}</span>
        )}
        <h3
          className="font-serif font-bold leading-snug group-hover:underline mt-1"
          style={{ fontSize: '1rem', color: 'var(--color-ink)' }}
        >
          {truncate(article.title, 100)}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginTop: '0.25rem' }}>
          {article.author && <span>{article.author} · </span>}
          {formatRelativeDate(article.published_at)}
        </p>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={href} className="article-card block group bg-white overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      {article.cover_image ? (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-paper-warm)' }}
        >
          <span style={{ fontSize: '2.5rem' }}>📰</span>
        </div>
      )}
      <div className="p-4">
        {article.categories && (
          <span className="category-badge">{article.categories.name}</span>
        )}
        <h3
          className="font-serif font-bold leading-snug group-hover:underline mt-1"
          style={{ fontSize: '1.05rem', color: 'var(--color-ink)' }}
        >
          {truncate(article.title, 100)}
        </h3>
        {article.description && (
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
            {truncate(article.description, 120)}
          </p>
        )}
        <div className="flex items-center justify-between mt-3" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
          <span>{article.author || 'Staff Reporter'}</span>
          <span>{formatRelativeDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
