import type { Metadata } from 'next';
import { fetchArticles } from '@/api';
import { HomeView } from '@/components/home/HomeView';
import { HOME_TITLE, SITE_DESCRIPTION, jsonLdString, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Portal DPE',
    type: 'website',
    locale: 'pt_BR',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    images: ['/logo.png'],
  },
};

// Roda no build (GitHub Actions): a lista de notícias já sai no HTML estático.
export default async function HomePage() {
  const articles = await fetchArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd()) }}
      />
      <HomeView initialArticles={articles} />
    </>
  );
}
