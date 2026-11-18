import type { Article } from '@/types';

export const SITE_URL = 'https://portaldpe.com.br';
export const SITE_NAME = 'Portal DPE';
export const HOME_TITLE = 'Portal DPE | Notícias e Política de Pernambuco';
export const SITE_DESCRIPTION =
  'Notícias, política e opinião de Pernambuco. O maior portal conservador do estado: compromisso com a verdade, defesa da família e os valores tradicionais.';
export const LOGO_URL = `${SITE_URL}/logo.png`;

/** Gera slug de URL a partir de um nome (ex.: "Opinião" -> "opiniao"). */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categoryPath = (slug: string) => `/categoria/${slug}/`;
export const articlePath = (slug: string) => `/article/${slug}/`;

/** Remove tags HTML e normaliza espaços. */
export const stripHtml = (html: string): string =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** Corta o texto em até `max` caracteres sem quebrar palavras. */
const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, '')}…`;
};

/**
 * Meta description do artigo. O "excerpt" às vezes é uma frase de efeito curta
 * (ex.: "Na falta de dinheiro, chame de contingenciamento"); nesses casos ele é
 * complementado com o início do texto para chegar a ~155 caracteres e trazer
 * os termos que as pessoas realmente pesquisam.
 */
export const buildDescription = (article: Pick<Article, 'excerpt' | 'content' | 'title'>): string => {
  const excerpt = (article.excerpt || '').trim();
  if (excerpt.length >= 110) return truncate(excerpt, 160);

  const body = stripHtml(article.content || '');
  const base = excerpt ? `${excerpt.replace(/[.!?…]*$/, '')}. ` : '';
  const combined = `${base}${body}`.trim() || article.title;
  return truncate(combined, 160);
};

export const authorLabel = (article: Article): string | null => {
  if (!article.showAuthor) return null;
  const name = article.authorName || article.author?.name;
  if (!name || /^reda[cç][aã]o/i.test(name)) return null;
  return name;
};

const publisher = {
  '@type': 'NewsMediaOrganization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: LOGO_URL },
  sameAs: ['https://www.instagram.com/direita.pernambuco/'],
};

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    { ...publisher, '@id': `${SITE_URL}/#organization` },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
});

export const articleJsonLd = (article: Article, categorySlugs: Record<string, string>) => {
  const url = `${SITE_URL}${articlePath(article.slug)}`;
  const author = authorLabel(article);
  const firstCategory = article.categories?.[0];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        url,
        headline: truncate(article.title, 110),
        description: buildDescription(article),
        image: article.imageUrl ? [article.imageUrl] : [LOGO_URL],
        datePublished: article.publishedAtISO,
        dateModified: article.modifiedAtISO || article.publishedAtISO,
        inLanguage: 'pt-BR',
        articleSection: article.categories?.length ? article.categories : undefined,
        author: author
          ? { '@type': 'Person', name: author }
          : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
          ...(firstCategory && categorySlugs[firstCategory]
            ? [{
                '@type': 'ListItem',
                position: 2,
                name: firstCategory,
                item: `${SITE_URL}${categoryPath(categorySlugs[firstCategory])}`,
              }]
            : []),
          {
            '@type': 'ListItem',
            position: firstCategory && categorySlugs[firstCategory] ? 3 : 2,
            name: article.title,
            item: url,
          },
        ],
      },
    ],
  };
};

/** Serializa JSON-LD com escape seguro para ser embutido em <script>. */
export const jsonLdString = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');
