# Task Plan — NYT-Style News Website

**Goal:** Build a full-stack news aggregation website (NYT-like) using Next.js, Node.js/Express, Supabase, and the NYT API.

---

## Phases

### Phase 1: Project Setup & Config [planned]
- [ ] Initialize Next.js (frontend) and Express.js (backend) projects
- [ ] Configure Supabase project and tables
- [ ] Setup environment variables (.env.local, .env)
- [ ] Configure Tailwind CSS in Next.js

### Phase 2: Database Schema [planned]
- [ ] Create users table
- [ ] Create categories table
- [ ] Create articles table
- [ ] Create comments table
- [ ] Create likes table
- [ ] Create bookmarks table
- [ ] Set up Row Level Security (RLS) policies in Supabase

### Phase 3: Backend API (Node.js + Express) [✅ COMPLETE]
- [x] Auth routes (register, login, refresh token)
- [x] Articles routes (CRUD)
- [x] Categories routes (CRUD)
- [x] Comments routes (CRUD)
- [x] Likes routes
- [x] Bookmarks routes
- [x] Admin routes
- [x] NYT API integration service + caching
- [x] JWT middleware
- [x] Role-based authorization middleware

### Phase 4: Frontend (Next.js + Tailwind) [✅ COMPLETE]
- [x] Homepage (featured + category grids)
- [x] Article detail page
- [x] Search results page
- [x] Auth pages (login, register)
- [x] Bookmarks page
- [x] Admin dashboard
- [x] Category pages

### Phase 5: Authentication [✅ COMPLETE]
- [x] JWT token generation on backend (generateTokens with configurable expiry)
- [x] Axios interceptors + token storage on frontend (401 auto-refresh queue)
- [x] Role-based route guards (ProtectedRoute + AdminRoute components)
- [x] CSRF protection (X-Requested-With header + backend validation)
- [x] Configurable JWT_REFRESH_EXPIRES_IN via env var

### Phase 6: NYT API Integration [✅ COMPLETE]
- [x] NYT API service module (fetch/search/popular/articleByUrl)
- [x] Caching strategy to Supabase (nyt_cache table + nytCache.service.js)
- [x] Scheduled sync job (configurable via NYT_SYNC_INTERVAL env var)
- [x] Cache TTL strategy (15min top stories, 30min popular, 1hr search)
- [x] Cache stats in admin dashboard

### Phase 7: Admin Dashboard [✅ COMPLETE]
- [x] Article management (CRUD + search + pagination + source/category filters)
- [x] Category management (CRUD with card layout + description editing)
- [x] User management (search + pagination + role change dropdown + lock/unlock)
- [x] Comment moderation (card layout + expandable content + pagination)
- [x] Stats overview (6 stat cards + NYT cache stats + quick actions)

### Phase 8: Deployment [planned]
- [ ] Frontend → Vercel
- [ ] Backend → Railway / Render
- [ ] Database → Supabase cloud

---

## Key Decisions
| Decision | Choice | Reason |
|---|---|---|
| Auth storage | httpOnly cookies + JWT | Secure, XSS-resistant |
| State management | React Context + SWR | Lightweight for this scale |
| API style | REST | Simpler, well-aligned with NYT API pattern |
| NYT caching | Store in Supabase articles table | Reduce API quota usage |
| Image hosting | Supabase Storage | Integrated with DB |
