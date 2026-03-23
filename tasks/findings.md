# Findings & Research Notes

## NYT API Key Facts
- Base URL: `https://api.nytimes.com/svc/`
- Top Stories API: `/topstories/v2/{section}.json`
- Article Search API: `/search/v2/articlesearch.json`
- Rate limit: 10 req/min, 4000 req/day (free tier)
- Returns: headline, abstract, url, thumbnail (multimedia), byline, published_date, section
- NYT articles cannot be stored permanently — cache with TTL
- Recommended cache TTL: 15 minutes for top stories, 1 hour for search

## Supabase Notes
- PostgreSQL under the hood — full SQL available
- Row Level Security (RLS) must be enabled for user data protection
- Supabase Storage for images (5GB free)
- Realtime subscriptions available for comments (optional)
- Auth: Supabase has built-in auth, but project uses custom JWT for full control

## Next.js Notes
- Use App Router (Next.js 14+)
- Server Components for SEO-critical pages (article detail, homepage)
- Client Components for interactive elements (comments, likes, bookmarks)
- ISR (Incremental Static Regeneration) for homepage — revalidate every 5 min
- Dynamic routes: /articles/[slug], /category/[slug]

## Security Decisions
- JWT stored in httpOnly cookie (not localStorage) → XSS safe
- Refresh token rotation pattern
- Admin routes protected by middleware on both backend and frontend
- Input sanitization for comments (DOMPurify or server-side)

## Folder Structure Decisions
- Monorepo: /frontend and /backend directories in root
- Shared types live in /shared (optional TypeScript types)
- Backend: MVC pattern (routes → controllers → services → models)
