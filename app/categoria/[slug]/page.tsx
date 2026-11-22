import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchActiveCategories } from '@/lib/categories';
import { CategoryListing, categoryMetadata, loadCategoryPage } from './CategoryListing';

// ISR: a página fica em cache e é refeita no máximo a cada 5 min; quando um
// artigo muda, /api/revalidate/ invalida na hora. O timer também cobre os
// artigos agendados, que entram no ar sozinhos quando chega o scheduled_at.
export const revalidate = 300;

// Editorias novas são geradas na primeira visita (slug inexistente -> 404).
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await fetchActiveCategories();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata(await loadCategoryPage(slug, 1));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug, 1);
  if (!data) notFound();
  return <CategoryListing {...data} />;
}
