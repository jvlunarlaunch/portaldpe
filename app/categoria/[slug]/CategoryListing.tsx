import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchArticles } from '@/api';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { fetchActiveCategories, type CategoryInfo } from '@/lib/categories';
import { SITE_URL, categoryPath, jsonLdString } from '@/lib/seo';
import type { Article } from '@/types';

/** Artigos por página nas editorias. */
export const PAGE_SIZE = 24;

/** /categoria/x/ para a página 1 e /categoria/x/page/N/ para as demais. */
export const categoryPageUrl = (slug: string, page: number) =>
  page <= 1 ? categoryPath(slug) : `${categoryPath(slug)}page/${page}/`;

export interface CategoryPageData {
  category: CategoryInfo;
  articles: Article[];
  page: number;
  totalPages: number;
}

/**
 * Busca uma página da editoria. Usa a mesma consulta que já roda no site (os
 * 1000 artigos mais recentes, filtrados pela editoria) e só corta a página.
 * Retorna null se a editoria não existe ou se a página passa do fim.
 */
export const loadCategoryPage = async (slug: string, page: number): Promise<CategoryPageData | null> => {
  const categories = await fetchActiveCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;

  const all = await fetchArticles({ limit: 1000 });
  const inCategory = all.filter((a) => a.categories?.includes(category.name));
  const totalPages = Math.max(1, Math.ceil(inCategory.length / PAGE_SIZE));
  if (page < 1 || page > totalPages) return null;

  return {
    category,
    articles: inCategory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    totalPages,
  };
};

export const categoryMetadata = (data: CategoryPageData | null): Metadata => {
  if (!data) return { title: 'Editoria não encontrada | Portal DPE', robots: { index: false } };

  const { category, page } = data;
  const suffix = page > 1 ? ` (página ${page})` : '';
  const title = `${category.name}: notícias e análises${suffix} | Portal DPE`;
  const description =
    page > 1
      ? `Página ${page} das notícias e análises de ${category.name} no Portal DPE, o portal conservador de Pernambuco.`
      : `Últimas notícias e análises de ${category.name} no Portal DPE, o portal conservador de Pernambuco.`;
  const url = `${SITE_URL}${categoryPageUrl(category.slug, page)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      siteName: 'Portal DPE',
      type: 'website',
      locale: 'pt_BR',
      title,
      description,
      url,
      images: ['/logo.png'],
    },
  };
};

/** Números mostrados na paginação: primeira, última e vizinhas da atual. */
const pageNumbers = (page: number, total: number): (number | '…')[] => {
  const wanted = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...wanted].sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push('…');
    result.push(n);
  });
  return result;
};

export function CategoryListing({ category, articles, page, totalPages }: CategoryPageData) {
  const url = `${SITE_URL}${categoryPageUrl(category.slug, page)}`;
  const baseUrl = `${SITE_URL}${categoryPath(category.slug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} | Portal DPE`,
    url,
    inLanguage: 'pt-BR',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: category.name, item: baseUrl },
      ],
    },
  };

  const linkClass = 'min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors';

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-24">
        <nav aria-label="Navegação estrutural" className="text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-azure-600 transition-colors">Início</Link>
          <span className="mx-2">/</span>
          {page > 1 ? (
            <>
              <Link href={categoryPath(category.slug)} className="hover:text-azure-600 transition-colors">{category.name}</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-600">Página {page}</span>
            </>
          ) : (
            <span className="text-slate-600">{category.name}</span>
          )}
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
          {category.name}
          {page > 1 && <span className="text-slate-400 font-medium text-2xl md:text-3xl"> · página {page}</span>}
        </h1>
        <p className="text-slate-500 mb-12">
          Notícias e análises de {category.name} no Portal DPE.
        </p>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} variant="standard" priority={page === 1 && i === 0} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            Sem notícias nesta editoria no momento.
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Paginação" className="mt-16 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={categoryPageUrl(category.slug, page - 1)}
                rel="prev"
                className={`${linkClass} text-slate-600 hover:bg-slate-100`}
              >
                ← Anterior
              </Link>
            )}
            {pageNumbers(page, totalPages).map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
              ) : n === page ? (
                <span key={n} aria-current="page" className={`${linkClass} bg-slate-900 text-white`}>{n}</span>
              ) : (
                <Link key={n} href={categoryPageUrl(category.slug, n)} className={`${linkClass} text-slate-600 hover:bg-slate-100`}>
                  {n}
                </Link>
              )
            )}
            {page < totalPages && (
              <Link
                href={categoryPageUrl(category.slug, page + 1)}
                rel="next"
                className={`${linkClass} text-slate-600 hover:bg-slate-100`}
              >
                Próxima →
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
