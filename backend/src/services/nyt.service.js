/**
 * NYT API Service — on-demand article fetching and search.
 * Used both by the cron sync and by API endpoints that proxy NYT data.
 */
require('dotenv').config();

const NYT_API_KEY = process.env.NYT_API_KEY;
const NYT_BASE_URL = process.env.NYT_BASE_URL || 'https://api.nytimes.com/svc';

/**
 * Fetch Top Stories from a given NYT section.
 * @param {string} section - e.g. 'home', 'technology', 'sports', 'arts'
 * @returns {Promise<Object[]>} array of raw NYT article objects
 */
async function fetchTopStories(section = 'home') {
  const url = `${NYT_BASE_URL}/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NYT API error: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  return body.results || [];
}

/**
 * Search NYT articles via the Article Search API.
 * @param {string} query  - search query
 * @param {number} page   - page number (0-indexed)
 * @returns {Promise<{ articles: Object[], totalHits: number }>}
 */
async function searchArticles(query, page = 0) {
  const url = `${NYT_BASE_URL}/search/v2/articlesearch.json?q=${encodeURIComponent(query)}&page=${page}&api-key=${NYT_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NYT Search API error: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  const docs = body.response?.docs || [];
  const totalHits = body.response?.meta?.hits || 0;

  const articles = docs.map(doc => ({
    title: doc.headline?.main || 'Untitled',
    abstract: doc.abstract || doc.snippet || '',
    url: doc.web_url,
    published_date: doc.pub_date,
    byline: doc.byline?.original || '',
    section: doc.section_name || '',
    image_url: doc.multimedia?.length
      ? `https://www.nytimes.com/${doc.multimedia[0].url}`
      : null,
    source: 'nyt',
  }));

  return { articles, totalHits };
}

/**
 * Fetch a single NYT article's metadata by URL (via Article Search API).
 * @param {string} articleUrl - the nytimes.com URL
 * @returns {Promise<Object|null>}
 */
async function fetchArticleByUrl(articleUrl) {
  const url = `${NYT_BASE_URL}/search/v2/articlesearch.json?fq=web_url:"${encodeURIComponent(articleUrl)}"&api-key=${NYT_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NYT API error: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  const doc = body.response?.docs?.[0];
  if (!doc) return null;

  return {
    title: doc.headline?.main || 'Untitled',
    abstract: doc.abstract || doc.snippet || '',
    url: doc.web_url,
    published_date: doc.pub_date,
    byline: doc.byline?.original || '',
    section: doc.section_name || '',
    image_url: doc.multimedia?.length
      ? `https://www.nytimes.com/${doc.multimedia[0].url}`
      : null,
  };
}

/**
 * Fetch most popular articles (most viewed, most shared, etc.)
 * @param {'viewed'|'shared'|'emailed'} type
 * @param {1|7|30} period - days
 * @returns {Promise<Object[]>}
 */
async function fetchMostPopular(type = 'viewed', period = 1) {
  const url = `${NYT_BASE_URL}/mostpopular/v2/${type}/${period}.json?api-key=${NYT_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NYT Most Popular API error: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  return body.results || [];
}

module.exports = {
  fetchTopStories,
  searchArticles,
  fetchArticleByUrl,
  fetchMostPopular,
};
