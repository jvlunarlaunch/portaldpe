export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categories: string[];
  readTime: string;
  date: string;
  imageUrl: string;
  featured?: boolean;
  main?: boolean;
  content?: string;
  updatedAt?: string;
  /** ISO 8601 da data de publicação (para SEO / dados estruturados) */
  publishedAtISO?: string;
  /** ISO 8601 da última modificação (para SEO / sitemap) */
  modifiedAtISO?: string;
  showThumbnail?: boolean;
  showAuthor?: boolean;
  author?: Author;
  authorId?: string;
  authorName?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string | null;
}

export interface Author {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
}

export enum RoutePath {
  HOME = '/',
  ADMIN = '/admin',
  ARTICLE = '/article/:slug'
}