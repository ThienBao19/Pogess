export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  cover_image?: string;
  author?: string;
  published_at: string;
  is_featured: boolean;
  source: 'admin' | 'nyt';
  nyt_url?: string;
  categories?: Category;
  likes_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  is_locked?: boolean;
  created_at?: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  users?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ArticlesResponse {
  data: Article[];
  pagination: Pagination;
}
