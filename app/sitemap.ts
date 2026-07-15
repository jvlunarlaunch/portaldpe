import type { MetadataRoute } from 'next';
import { fetchArticles } from '@/api';

export const dynamic = 'force-static';

const DOMAIN = 'https://portaldpe.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${DOMAIN}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${DOMAIN}/about/`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${DOMAIN}/article/${article.slug}/`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
