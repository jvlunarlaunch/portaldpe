import type { Metadata } from 'next';
import { fetchArticles } from '@/api';
import { HomeView } from '@/components/home/HomeView';
import { fetchActiveCategories } from '@/lib/categories';
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

// ISR: a página fica em cache e é refeita no máximo a cada 5 min; quando um
// artigo muda, /api/revalidate/ invalida na hora. O timer também cobre os
// artigos agendados, que entram no ar sozinhos quando chega o scheduled_at.
export const revalidate = 300;

export default async function HomePage() {
  const [articles, categories] = await Promise.all([fetchArticles(), fetchActiveCategories()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd()) }}
      />
      <HomeView initialArticles={articles} categories={categories} />
    </>
  );
}
