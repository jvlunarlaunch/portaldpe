import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAllPublishedForSitemap, fetchArticleBySlug, fetchRelatedArticles } from '@/api';
import { fetchCategorySlugMap } from '@/lib/categories';
import { SITE_URL, articleJsonLd, articlePath, authorLabel, buildDescription, jsonLdString } from '@/lib/seo';
import { ArticleView } from './ArticleView';

export async function generateStaticParams() {
  const entries = await fetchAllPublishedForSitemap();
  return entries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artigo não encontrado | Portal DPE',
      robots: { index: false },
    };
  }

  const url = `${SITE_URL}${articlePath(article.slug)}`;
  const description = buildDescription(article);
  const author = authorLabel(article);

  return {
    title: `${article.title} | Portal DPE`,
    description,
    alternates: { canonical: url },
    authors: [{ name: author || 'Redação Portal DPE' }],
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      siteName: 'Portal DPE',
      type: 'article',
      locale: 'pt_BR',
      title: article.title,
      description,
      url,
      publishedTime: article.publishedAtISO,
      modifiedTime: article.modifiedAtISO,
      section: article.categories?.[0],
      authors: author ? [author] : undefined,
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }]
        : ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : ['/logo.png'],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [relatedArticles, categorySlugs] = await Promise.all([
    fetchRelatedArticles(article.id),
    fetchCategorySlugMap(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd(article, categorySlugs)) }}
      />
      <ArticleView article={article} relatedArticles={relatedArticles} categorySlugs={categorySlugs} />
    </>
  );
}
