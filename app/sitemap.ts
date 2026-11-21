import type { MetadataRoute } from 'next';
import { fetchAllPublishedForSitemap } from '@/api';
import { fetchActiveCategories } from '@/lib/categories';
import { SITE_URL, articlePath, categoryPath } from '@/lib/seo';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    fetchAllPublishedForSitemap(),
    fetchActiveCategories(),
  ]);

  // A home "muda" quando sai um artigo novo, não a cada build.
  const latest = articles.reduce<string | undefined>(
    (max, a) => (!max || a.modifiedAt > max ? a.modifiedAt : max),
    undefined,
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/about/`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}${categoryPath(c.slug)}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}${articlePath(a.slug)}`,
    lastModified: a.modifiedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
