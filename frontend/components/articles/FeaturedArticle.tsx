import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';
import { formatDate, truncate } from '@/lib/utils';

interface FeaturedArticleProps {
  article: Article;
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block"
      style={{ borderRight: '1px solid var(--color-border)' }}
    >
      {/* Large hero image */}
      {article.cover_image ? (
        <div className="relative w-full overflow-hidden" style={{ height: '360px' }}>
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            priority
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ height: '360px', backgroundColor: 'var(--color-paper-warm)', fontSize: '5rem' }}
        >
          📰
        </div>
      )}

      <div className="pr-6 pt-4">
        {article.categories && (
          <span className="category-badge">{article.categories.name}</span>
        )}
        <h2
          className="article-headline group-hover:underline mt-2"
          style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--color-ink)' }}
        >
          {article.title}
        </h2>
        {article.description && (
          <p
            className="mt-2 leading-relaxed"
            style={{ fontSize: '1rem', color: 'var(--color-ink-light)', fontFamily: 'Georgia, serif' }}
          >
            {truncate(article.description, 200)}
          </p>
        )}
        <p className="mt-3 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          {article.author && <span>By {article.author} · </span>}
          {formatDate(article.published_at)}
        </p>
      </div>
    </Link>
  );
}
