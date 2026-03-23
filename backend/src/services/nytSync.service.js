require('dotenv').config();
const supabase = require('../config/supabase');
const slugify = require('slugify');

const NYT_API_KEY = process.env.NYT_API_KEY;
const NYT_BASE_URL = process.env.NYT_BASE_URL || 'https://api.nytimes.com/svc';

// Map NYT sections → our category slugs
const SECTION_MAP = {
  home:        'current-affairs',
  technology:  'technology',
  sports:      'sports',
  arts:        'entertainment',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Transform a raw NYT Top Stories result into our articles schema.
 */
function transformTopStory(item, categoryId) {
  const title = item.title || 'Untitled';
  const rawSlug = slugify(title, { lower: true, strict: true });
  // Truncate to avoid DB constraint issues
  const slug = rawSlug.substring(0, 240) + '-nyt';

  const multimedia = Array.isArray(item.multimedia)
    ? item.multimedia.find(m => m.format === 'mediumThreeByTwo440') || item.multimedia[0]
    : null;

  return {
    title,
    slug,
    description: item.abstract || '',
    content: item.abstract || '',
    cover_image: multimedia?.url || null,
    author: item.byline?.replace('By ', '') || 'NYT Staff',
    category_id: categoryId,
    source: 'nyt',
    nyt_url: item.url || null,
    published_at: item.published_date || new Date().toISOString(),
    is_featured: false,
  };
}

/**
 * Fetch category ID by slug from Supabase.
 */
async function getCategoryId(slug) {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();
  return data?.id || null;
}

/**
 * Fetch and cache Top Stories for a given NYT section.
 */
async function syncSection(section) {
  const categorySlug = SECTION_MAP[section];
  const categoryId = await getCategoryId(categorySlug);
  if (!categoryId) {
    console.warn(`⚠️  Category not found for section: ${section}`);
    return;
  }

  const url = `${NYT_BASE_URL}/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ NYT API error for section ${section}: ${response.status}`);
    return;
  }

  const json = await response.json();
  const results = json.results || [];
  const articles = results
    .filter(item => item.title && item.url)
    .map(item => transformTopStory(item, categoryId));

  // Upsert articles (conflict on slug)
  const { error } = await supabase
    .from('articles')
    .upsert(articles, { onConflict: 'slug', ignoreDuplicates: false });

  if (error) {
    console.error(`❌ Upsert error for section ${section}:`, error.message);
  } else {
    console.log(`✅ Synced ${articles.length} articles from NYT section: ${section}`);
  }
}

/**
 * Main sync function — runs through all configured sections.
 */
async function syncAllSections() {
  if (!NYT_API_KEY) {
    console.warn('⚠️  NYT_API_KEY not set. Skipping sync.');
    return;
  }
  console.log('🔄 Starting NYT articles sync...');
  for (const section of Object.keys(SECTION_MAP)) {
    await syncSection(section);
    await delay(150); // respect 10 req/min rate limit
  }
  console.log('✅ NYT sync complete.');
}

module.exports = { syncAllSections };
