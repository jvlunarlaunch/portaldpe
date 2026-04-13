// Production server: serves the Vite SPA and injects Open Graph meta tags
// for social media crawlers (WhatsApp, Telegram, Facebook, etc.)
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load .env.local in development, .env in production
config({ path: '.env.local' });
config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Regex of known social/bot crawlers that read OG meta tags
const BOT_UA = /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot|ia_archiver|rogerbot|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator/i;

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const app = express();

// Serve static assets (JS, CSS, images) from dist/
app.use(express.static(DIST));

// Article route: if the request comes from a bot, inject OG tags
app.get('/article/:slug', async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  const indexPath = join(DIST, 'index.html');

  if (!BOT_UA.test(ua)) {
    // Regular browser: serve the SPA as-is
    return res.sendFile(indexPath);
  }

  // Bot detected: fetch article data and inject OG tags
  const { slug } = req.params;

  try {
    const { data: article, error } = await supabase
      .from('articles_portaldpe')
      .select('title, excerpt, image_url, slug')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      return res.sendFile(indexPath);
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const siteUrl = `${protocol}://${host}`;
    const articleUrl = `${siteUrl}/article/${escapeHtml(slug)}`;

    const ogTags = `
  <meta property="og:site_name" content="Portal DPE" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(article.title)}" />
  <meta property="og:description" content="${escapeHtml(article.excerpt)}" />
  <meta property="og:url" content="${articleUrl}" />
  ${article.image_url
    ? `<meta property="og:image" content="${escapeHtml(article.image_url)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(article.title)}" />`
    : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(article.title)}" />
  <meta name="twitter:description" content="${escapeHtml(article.excerpt)}" />
  ${article.image_url ? `<meta name="twitter:image" content="${escapeHtml(article.image_url)}" />` : ''}`;

    let html = readFileSync(indexPath, 'utf-8');

    // Inject the article title and OG tags into <head>
    html = html.replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeHtml(article.title)} | Portal DPE</title>`
    );
    html = html.replace('</head>', `${ogTags}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('[OG Server] Error fetching article:', err);
    res.sendFile(join(DIST, 'index.html'));
  }
});

// SPA fallback: all other routes return index.html
app.get('*', (_req, res) => {
  res.sendFile(join(DIST, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Portal DPE server running → http://localhost:${PORT}`);
});
