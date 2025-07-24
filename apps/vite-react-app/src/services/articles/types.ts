// apps/vite-react-app/src/services/articles/types.ts

import { PaginatedResponse } from "../base/types";

// Article Types
export interface Article {
  id: number;
  title: string;
  description: string;
  slug: string;
  excerpt?: string;
  img_url?: string;
  category: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  is_draft: boolean;
  display_excerpt: string;
}

// Request Types
export interface ArticleCreate {
  title: string;
  description: string;
  slug: string;
  excerpt?: string;
  img_url?: string;
  category: string;
  is_published?: boolean;
  published_at?: string;
}

export interface ArticleUpdate {
  title?: string;
  description?: string;
  slug?: string;
  excerpt?: string;
  img_url?: string;
  category?: string;
  is_published?: boolean;
  published_at?: string;
}

export interface ArticlePublish {
  is_published: boolean;
  published_at?: string;
}

// Response Types
export interface ArticleResponse extends Article {}

export interface ArticleListResponse extends PaginatedResponse<Article> {}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  img_url?: string;
  category: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface CategoryListResponse {
  categories: string[];
  total: number;
}

// Filter Types
export interface ArticleFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  is_published?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  published_after?: string;
  published_before?: string;
}

// Statistics Types
export interface ArticleStatistics {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  categories: string[];
  articles_this_month: number;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}