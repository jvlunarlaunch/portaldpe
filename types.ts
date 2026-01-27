export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl: string;
  featured?: boolean;
  main?: boolean;
  content?: string;
  updatedAt?: string;
  showThumbnail?: boolean;
  showAuthor?: boolean;
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