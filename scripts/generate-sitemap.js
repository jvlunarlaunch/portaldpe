import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://portaldpe.com.br';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
    try {
        console.log('Fetching articles from Supabase...');

        // 1. Fetch all published articles
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at')
            .eq('status', 'published');

        if (error) throw error;

        // 2. Define static routes
        const staticRoutes = [
            { url: '/', lastmod: new Date().toISOString() },
        ];

        // 3. Combine with dynamic products
        const dynamicRoutes = articles.map((article) => ({
            url: `/article/${article.slug}`,
            lastmod: article.updated_at || new Date().toISOString(),
        }));

        const allRoutes = [...staticRoutes, ...dynamicRoutes];

        // 4. Generate XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
                .map((route) => {
                    return `  <url>
    <loc>${DOMAIN}${route.url}</loc>
    <lastmod>${route.lastmod.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.url === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
                })
                .join('\n')}
</urlset>`;

        // 5. Write to public folder
        const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        fs.writeFileSync(publicPath, sitemap);

        console.log(`✅ Sitemap generated successfully at ${publicPath}`);
        console.log(`Total URLs: ${allRoutes.length}`);
    } catch (err) {
        console.error('❌ Error generating sitemap:', err.message);
    }
}

generateSitemap();
