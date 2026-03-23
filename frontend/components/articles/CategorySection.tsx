import { Article } from '@/types';
import ArticleCard from './ArticleCard';
import Link from 'next/link';

interface CategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
}

export default function CategorySection({ title, slug, articles }: CategorySectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 section-divider">
        <h2
          className="font-serif font-bold uppercase tracking-wide"
          style={{ fontSize: '0.875rem', color: 'var(--color-ink)', letterSpacing: '0.1em' }}
        >
          {title}
        </h2>
        <Link
          href={`/category/${slug}`}
          className="text-xs uppercase font-semibold tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-link)', letterSpacing: '0.06em' }}
        >
          See All →
        </Link>
      </div>

      {/* Article grid: 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.slice(0, 4).map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
