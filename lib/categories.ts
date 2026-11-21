import { fetchArticles, fetchCategories } from '@/api';
import { slugify } from '@/lib/seo';

export interface CategoryInfo {
  name: string;
  slug: string;
}

/**
 * Categorias que têm ao menos um artigo publicado, com o slug usado na URL
 * (/categoria/<slug>/). Usa a coluna `slug` da tabela quando existir; senão
 * gera a partir do nome.
 */
// O servidor fica no ar por dias, então o cache não pode ser eterno: guarda o
// resultado por 60 s para não repetir as consultas em cada página, mas pega
// editorias novas logo depois.
const CACHE_TTL_MS = 60_000;
let cache: { at: number; promise: Promise<CategoryInfo[]> } | null = null;

export const fetchActiveCategories = (): Promise<CategoryInfo[]> => {
  if (!cache || Date.now() - cache.at > CACHE_TTL_MS) {
    const promise = loadActiveCategories().catch((err) => {
      cache = null;
      throw err;
    });
    cache = { at: Date.now(), promise };
  }
  return cache.promise;
};

/** Descarta o cache (chamado pelo /api/revalidate/). */
export const clearCategoriesCache = () => {
  cache = null;
};

const loadActiveCategories = async (): Promise<CategoryInfo[]> => {
  const [categories, articles] = await Promise.all([fetchCategories(), fetchArticles({ limit: 1000 })]);

  const used = new Set(articles.flatMap((a) => a.categories || []));
  const seen = new Set<string>();
  const result: CategoryInfo[] = [];

  const names = categories.length > 0 ? categories.map((c) => ({ name: c.name, slug: c.slug })) : [...used].map((name) => ({ name, slug: '' }));

  for (const c of names) {
    if (!c.name || !used.has(c.name)) continue;
    const slug = (c.slug && slugify(c.slug)) || slugify(c.name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    result.push({ name: c.name, slug });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

/** Mapa nome da categoria -> slug da URL. */
export const fetchCategorySlugMap = async (): Promise<Record<string, string>> => {
  const list = await fetchActiveCategories();
  return Object.fromEntries(list.map((c) => [c.name, c.slug]));
};
