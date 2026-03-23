import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedArticles, getArticles } from '@/lib/api';
import FeaturedArticle from '@/components/articles/FeaturedArticle';
import ArticleCard from '@/components/articles/ArticleCard';
import CategorySection from '@/components/articles/CategorySection';
import { Article } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'The Daily Press — Breaking News & In-Depth Reporting',
};

export const revalidate = 300; // ISR: revalidate every 5 minutes

async function getHomeData() {
  try {
    const [featuredRes, latestRes, techRes, sportsRes, entRes] = await Promise.allSettled([
      getFeaturedArticles(),
      getArticles({ limit: 9, page: 1 }),
      getArticles({ category: 'technology', limit: 4 }),
      getArticles({ category: 'sports', limit: 4 }),
      getArticles({ category: 'entertainment', limit: 4 }),
    ]);

    return {
      featured: featuredRes.status === 'fulfilled' ? featuredRes.value.data : [],
      latest:   latestRes.status === 'fulfilled'  ? latestRes.value.data  : [],
      tech:     techRes.status === 'fulfilled'    ? techRes.value.data    : [],
      sports:   sportsRes.status === 'fulfilled'  ? sportsRes.value.data  : [],
      ent:      entRes.status === 'fulfilled'     ? entRes.value.data     : [],
    };
  } catch {
    return { featured: [], latest: [], tech: [], sports: [], ent: [] };
  }
}

export default async function HomePage() {
  const { featured, latest, tech, sports, ent } = await getHomeData();

  const hero: Article | undefined = featured[0] || latest[0];
  const secondaries: Article[] = featured.slice(1, 3).length >= 2
    ? featured.slice(1, 3)
    : latest.slice(1, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ── Featured / Hero Section ──────────────────────── */}
      <section className="mb-8">
        <div
          className="pb-2 mb-4"
          style={{ borderBottom: '3px solid var(--color-ink)' }}
        >
          <span
            className="font-bold uppercase tracking-widest"
            style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', letterSpacing: '0.12em' }}
          >
            Featured
          </span>
        </div>

        {hero ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
            {/* Main hero — takes 2/3 */}
            <div className="lg:col-span-2">
              <FeaturedArticle article={hero} />
            </div>

            {/* Secondary stories — 1/3 */}
            <div className="pl-0 lg:pl-6 pt-6 lg:pt-0 space-y-6" style={{ borderTop: '1px solid var(--color-border)' }} >
              {secondaries.map((article, i) => (
                <div key={article.id}>
                  {i > 0 && <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} />}
                  <Link href={`/articles/${article.slug}`} className="group block">
                    {article.cover_image && (
                      <div className="relative w-full h-36 overflow-hidden mb-3">
                        <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
                      </div>
                    )}
                    {article.categories && (
                      <span className="category-badge">{article.categories.name}</span>
                    )}
                    <h3
                      className="font-serif font-bold group-hover:underline mt-1"
                      style={{ fontSize: '1rem', lineHeight: '1.3', color: 'var(--color-ink)' }}
                    >
                      {article.title}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)' }}>
                      {formatRelativeDate(article.published_at)}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--color-ink-muted)' }}>
            <p className="font-serif text-xl">No articles yet.</p>
            <p className="text-sm mt-2">Articles will appear after the NYT sync runs.</p>
          </div>
        )}
      </section>

      {/* ── Latest News ───────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="mb-10">
          <div className="section-divider flex items-center justify-between mb-4">
            <h2
              className="font-serif font-bold uppercase tracking-wide"
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em', color: 'var(--color-ink)' }}
            >
              Latest News
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latest.slice(0, 6).map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* ── Category Sections ─────────────────────────────── */}
      <CategorySection title="Technology" slug="technology" articles={tech} />
      <CategorySection title="Sports" slug="sports" articles={sports} />
      <CategorySection title="Entertainment" slug="entertainment" articles={ent} />
    </div>
  );
}
