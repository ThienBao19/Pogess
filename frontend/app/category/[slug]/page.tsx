import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles } from '@/lib/api';
import ArticleCard from '@/components/articles/ArticleCard';

const CATEGORY_LABELS: Record<string, string> = {
  'current-affairs': 'Current Affairs',
  'technology':      'Technology',
  'sports':          'Sports',
  'entertainment':   'Entertainment',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug] || slug;
  return {
    title: `${label} News`,
    description: `Latest ${label} articles and news`,
  };
}

export const revalidate = 300;

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug];
  if (!label) notFound();

  let articles: import('@/types').Article[] = [];
  try {
    const res = await getArticles({ category: slug, limit: 20 });
    articles = res.data || [];
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="section-divider mb-6">
        <h1
          className="font-serif font-bold"
          style={{ fontSize: '1.75rem', color: 'var(--color-ink)' }}
        >
          {label}
        </h1>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
          <p className="font-serif text-xl">No articles in this category yet.</p>
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
