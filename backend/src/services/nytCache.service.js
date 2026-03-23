/**
 * NYT Cache Service — Supabase-backed caching layer for NYT API calls.
 *
 * Wraps nyt.service.js functions with a read-through cache:
 *   1. Check nyt_cache table for a valid (non-expired) entry
 *   2. If hit → return cached data
 *   3. If miss → call NYT API, store response in cache, return data
 *
 * TTL strategy:
 *   - Top Stories: 15 min (breaking news changes frequently)
 *   - Search results: 60 min (less volatile)
 *   - Most Popular: 30 min
 */

const supabase = require('../config/supabase');
const nytService = require('./nyt.service');

// TTL in seconds for each cache type
const TTL = {
  topStories: 15 * 60,    // 15 minutes
  search: 60 * 60,        // 1 hour
  popular: 30 * 60,       // 30 minutes
  articleByUrl: 60 * 60,  // 1 hour
};

/**
 * Read from cache. Returns data if valid, null if miss/expired.
 */
async function getFromCache(cacheKey) {
  const { data, error } = await supabase
    .from('nyt_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();

  if (error || !data) return null;

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    // Expired — clean up asynchronously
    supabase.from('nyt_cache').delete().eq('cache_key', cacheKey).then(() => {});
    return null;
  }

  return data.data;
}

/**
 * Write to cache. Upserts on cache_key conflict.
 */
async function setCache(cacheKey, responseData, ttlSeconds) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const { error } = await supabase
    .from('nyt_cache')
    .upsert(
      {
        cache_key: cacheKey,
        data: responseData,
        ttl_seconds: ttlSeconds,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' }
    );

  if (error) {
    console.warn(`[NYT Cache] Failed to write cache for key "${cacheKey}":`, error.message);
  }
}

/**
 * Invalidate all expired cache entries. Called periodically.
 */
async function purgeExpired() {
  const { error, count } = await supabase
    .from('nyt_cache')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.warn('[NYT Cache] Purge failed:', error.message);
  } else if (count > 0) {
    console.log(`[NYT Cache] Purged ${count} expired entries`);
  }
}

/**
 * Get cache statistics for admin dashboard.
 */
async function getCacheStats() {
  const { count: totalEntries } = await supabase
    .from('nyt_cache')
    .select('*', { count: 'exact', head: true });

  const { count: activeEntries } = await supabase
    .from('nyt_cache')
    .select('*', { count: 'exact', head: true })
    .gte('expires_at', new Date().toISOString());

  const { count: expiredEntries } = await supabase
    .from('nyt_cache')
    .select('*', { count: 'exact', head: true })
    .lt('expires_at', new Date().toISOString());

  return {
    totalEntries: totalEntries || 0,
    activeEntries: activeEntries || 0,
    expiredEntries: expiredEntries || 0,
  };
}

// ── Cached wrappers for nyt.service functions ─────────────────

async function fetchTopStories(section = 'home') {
  const cacheKey = `topstories:${section}`;
  const cached = await getFromCache(cacheKey);
  if (cached) {
    console.log(`[NYT Cache] HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`[NYT Cache] MISS: ${cacheKey} — calling NYT API`);
  const data = await nytService.fetchTopStories(section);
  await setCache(cacheKey, data, TTL.topStories);
  return data;
}

async function searchArticles(query, page = 0) {
  const cacheKey = `search:${query.toLowerCase().trim()}:${page}`;
  const cached = await getFromCache(cacheKey);
  if (cached) {
    console.log(`[NYT Cache] HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`[NYT Cache] MISS: ${cacheKey} — calling NYT API`);
  const data = await nytService.searchArticles(query, page);
  await setCache(cacheKey, data, TTL.search);
  return data;
}

async function fetchArticleByUrl(articleUrl) {
  const cacheKey = `article-url:${articleUrl}`;
  const cached = await getFromCache(cacheKey);
  if (cached) {
    console.log(`[NYT Cache] HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`[NYT Cache] MISS: ${cacheKey} — calling NYT API`);
  const data = await nytService.fetchArticleByUrl(articleUrl);
  if (data) {
    await setCache(cacheKey, data, TTL.articleByUrl);
  }
  return data;
}

async function fetchMostPopular(type = 'viewed', period = 1) {
  const cacheKey = `popular:${type}:${period}`;
  const cached = await getFromCache(cacheKey);
  if (cached) {
    console.log(`[NYT Cache] HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`[NYT Cache] MISS: ${cacheKey} — calling NYT API`);
  const data = await nytService.fetchMostPopular(type, period);
  await setCache(cacheKey, data, TTL.popular);
  return data;
}

module.exports = {
  fetchTopStories,
  searchArticles,
  fetchArticleByUrl,
  fetchMostPopular,
  getCacheStats,
  purgeExpired,
};
