import { fetchAllPublishedForSitemap } from '@/api';
import { SITE_URL, articlePath } from '@/lib/seo';

// Gerado no build (o site é exportado como estático).
export const dynamic = 'force-static';

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Sitemap de notícias (formato Google News): só artigos dos últimos 2 dias,
 * como exige o Google. Atualizado a cada deploy (a cada 20 min pelo workflow).
 */
export async function GET() {
  const articles = await fetchAllPublishedForSitemap();
  const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const recent = articles.filter((a) => new Date(a.publishedAt).getTime() >= cutoff).slice(0, 1000);

  const urls = recent
    .map(
      (a) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${articlePath(a.slug)}`)}</loc>
    <lastmod>${a.modifiedAt}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Portal DPE</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
