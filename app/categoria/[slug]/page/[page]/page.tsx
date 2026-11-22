import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { categoryPath } from '@/lib/seo';
import { CategoryListing, categoryMetadata, loadCategoryPage } from '../../CategoryListing';

// /categoria/<slug>/page/<n>/ (n >= 2). Mesmo cache das demais páginas.
export const revalidate = 300;
export const dynamicParams = true;

// Nenhuma página pré-gerada no build: cada uma é gerada na primeira visita e
// fica em cache (ISR).
export async function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string; page: string }>;

/** Aceita só números inteiros sem zeros à esquerda ("2", "15"). */
const parsePage = (raw: string): number | null => (/^[1-9]\d{0,4}$/.test(raw) ? Number(raw) : null);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, page: raw } = await params;
  const page = parsePage(raw);
  if (!page || page < 2) return categoryMetadata(null);
  return categoryMetadata(await loadCategoryPage(slug, page));
}

export default async function CategoryPaginatedPage({ params }: { params: Params }) {
  const { slug, page: raw } = await params;
  const page = parsePage(raw);
  if (!page) notFound();
  // /page/1/ é a mesma coisa que a página principal da editoria.
  if (page === 1) permanentRedirect(categoryPath(slug));

  const data = await loadCategoryPage(slug, page);
  if (!data) notFound();
  return <CategoryListing {...data} />;
}
