import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAllPublishedSlugs, fetchArticleBySlug, fetchRelatedArticles } from '@/api';
import { ArticleView } from './ArticleView';

export async function generateStaticParams() {
  const slugs = await fetchAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
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

  const url = `https://portaldpe.com.br/article/${article.slug}/`;

  return {
    title: `${article.title} | Portal DPE`,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      siteName: 'Portal DPE',
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url,
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
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

  const relatedArticles = await fetchRelatedArticles(article.id);

  return <ArticleView article={article} relatedArticles={relatedArticles} />;
}
