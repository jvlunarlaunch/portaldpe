import type { MetadataRoute } from 'next';

export const revalidate = 300;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin/' },
    ],
    sitemap: [
      'https://portaldpe.com.br/sitemap.xml',
      'https://portaldpe.com.br/news-sitemap.xml',
    ],
  };
}
