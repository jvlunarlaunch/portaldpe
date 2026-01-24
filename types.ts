export interface Article {
  id: string;
  slug: string;
  title: string;
  title_pt?: string;
  excerpt: string;
  excerpt_pt?: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl: string;
  featured?: boolean;
  main?: boolean;
  content?: string;
  content_pt?: string;
  updatedAt?: string;
  showThumbnail?: boolean;
  author?: Author;
  authorId?: string;
  status: 'draft' | 'published';
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