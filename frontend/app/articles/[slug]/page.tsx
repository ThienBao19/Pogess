import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import CommentSection from '@/components/article-detail/CommentSection';
import ArticleActions from '@/components/article-detail/ArticleActions';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticleBySlug(slug);
    return {
      title: article.title,
      description: article.description,
      openGraph: {
        title: article.title,
        description: article.description,
        images: article.cover_image ? [article.cover_image] : [],
      },
    };
  } catch {
    return { title: 'Article Not Found' };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Category + metadata */}
      <header className="mb-6">
        {article.categories && (
          <span className="category-badge text-sm">{article.categories.name}</span>
        )}
        <h1
          className="article-headline mt-2"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: 'var(--color-ink)' }}
        >
          {article.title}
        </h1>
        {article.description && (
          <p
            className="mt-3 text-lg leading-relaxed"
            style={{ color: 'var(--color-ink-light)', fontFamily: 'Georgia, serif' }}
          >
            {article.description}
          </p>
        )}
        <div
          className="flex flex-wrap items-center gap-4 mt-4 pb-4"
          style={{ borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}
        >
          {article.author && <span>By <strong style={{ color: 'var(--color-ink)' }}>{article.author}</strong></span>}
          <span>{formatDate(article.published_at)}</span>
          {article.nyt_url && (
            <a
              href={article.nyt_url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
              style={{ color: 'var(--color-link)' }}
            >
              Read on NYT ↗
            </a>
          )}
        </div>
      </header>

      {/* Cover image */}
      {article.cover_image && (
        <div className="relative w-full mb-8 overflow-hidden rounded-sm" style={{ height: '400px' }}>
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Article body */}
      <div
        className="article-body mb-8 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{
          __html: article.content
            ? article.content.replace(/\n/g, '<br />')
            : `<p>${article.description || 'No content available.'}</p>`,
        }}
      />

      {/* Like + Bookmark actions */}
      <ArticleActions articleId={article.id} initialLikes={article.likes_count || 0} />

      {/* Comments */}
      <CommentSection articleId={article.id} />
    </article>
  );
}
