import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchArticles } from '@/api';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { fetchActiveCategories } from '@/lib/categories';
import { SITE_URL, categoryPath, jsonLdString } from '@/lib/seo';

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

const findCategory = async (slug: string) => {
  const categories = await fetchActiveCategories();
  return categories.find((c) => c.slug === slug) || null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return { title: 'Editoria não encontrada | Portal DPE', robots: { index: false } };

  const title = `${category.name}: notícias e análises | Portal DPE`;
  const description = `Últimas notícias e análises de ${category.name} no Portal DPE, o portal conservador de Pernambuco.`;
  const url = `${SITE_URL}${categoryPath(category.slug)}`;

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
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();

  const all = await fetchArticles({ limit: 1000 });
  const articles = all.filter((a) => a.categories?.includes(category.name));
  const url = `${SITE_URL}${categoryPath(category.slug)}`;

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
        { '@type': 'ListItem', position: 2, name: category.name, item: url },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-24">
        <nav aria-label="Navegação estrutural" className="text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-azure-600 transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-600">{category.name}</span>
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">{category.name}</h1>
        <p className="text-slate-500 mb-12">
          Notícias e análises de {category.name} no Portal DPE.
        </p>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            Sem notícias nesta editoria no momento.
          </div>
        )}
      </section>
    </div>
  );
}
