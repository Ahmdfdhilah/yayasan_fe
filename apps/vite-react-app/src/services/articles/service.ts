// apps/vite-react-app/src/services/articles/service.ts
import { BaseService } from "../base";
import {
  ArticleCreate,
  ArticleUpdate,
  ArticlePublish,
  ArticleResponse,
  ArticleListResponse,
  ArticleSummary,
  ArticleFilterParams,
  ArticleStatistics,
  CategoryListResponse,
  MessageResponse,
} from "./types";

class ArticleService extends BaseService {
  constructor() {
    super("/articles");
  }

  // List articles with filtering
  async getArticles(
    params?: ArticleFilterParams
  ): Promise<ArticleListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }

  // Get published articles
  async getPublishedArticles(limit?: number): Promise<ArticleResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/published?${queryParams.toString()}` : "/published";
    return this.get(endpoint);
  }

  // Get draft articles (requires auth)
  async getDraftArticles(limit?: number): Promise<ArticleResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/drafts?${queryParams.toString()}` : "/drafts";
    return this.get(endpoint);
  }

  // Get all categories
  async getCategories(): Promise<CategoryListResponse> {
    return this.get("/categories");
  }

  // Get articles by category
  async getArticlesByCategory(
    category: string, 
    limit?: number, 
    publishedOnly: boolean = true
  ): Promise<ArticleResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    queryParams.append("published_only", publishedOnly.toString());
    
    return this.get(`/categories/${encodeURIComponent(category)}?${queryParams.toString()}`);
  }

  // Get latest articles
  async getLatestArticles(
    limit: number = 5, 
    publishedOnly: boolean = true
  ): Promise<ArticleResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    queryParams.append("published_only", publishedOnly.toString());
    
    return this.get(`/latest?${queryParams.toString()}`);
  }

  // Search articles
  async searchArticles(
    query: string, 
    limit?: number, 
    publishedOnly: boolean = true
  ): Promise<ArticleResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    queryParams.append("published_only", publishedOnly.toString());
    
    return this.get(`/search?${queryParams.toString()}`);
  }

  // Get article statistics (admin only)
  async getArticleStatistics(): Promise<ArticleStatistics> {
    return this.get("/statistics");
  }

  // Get article summaries
  async getArticleSummaries(
    params?: ArticleFilterParams
  ): Promise<ArticleSummary[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/summaries?${queryParams.toString()}` : "/summaries";
    return this.get(endpoint);
  }

  // Create new article with multipart form data (requires auth)
  async createArticle(
    data: ArticleCreate,
    image: File
  ): Promise<ArticleResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);
    
    return this.post("/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get article by ID
  async getArticleById(
    articleId: number
  ): Promise<ArticleResponse> {
    return this.get(`/${articleId}`);
  }

  // Get article by slug
  async getArticleBySlug(
    slug: string
  ): Promise<ArticleResponse> {
    return this.get(`/slug/${encodeURIComponent(slug)}`);
  }

  // Update article with optional image upload (requires auth)
  async updateArticle(
    articleId: number,
    data: ArticleUpdate,
    image?: File
  ): Promise<ArticleResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${articleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete article (requires auth)
  async deleteArticle(
    articleId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${articleId}`);
  }

  // Publish/unpublish article (requires auth)
  async publishArticle(
    articleId: number,
    publishData: ArticlePublish
  ): Promise<ArticleResponse> {
    return this.post(`/${articleId}/publish`, publishData);
  }

  // Duplicate article (requires auth)
  async duplicateArticle(
    articleId: number,
    newTitle?: string,
    newSlug?: string
  ): Promise<ArticleResponse> {
    const data: any = {};
    if (newTitle) data.new_title = newTitle;
    if (newSlug) data.new_slug = newSlug;
    
    return this.post(`/${articleId}/duplicate`, data);
  }

  // Bulk publish articles (admin only)
  async bulkPublishArticles(
    articleIds: number[],
    isPublished: boolean = true
  ): Promise<MessageResponse> {
    return this.post("/bulk/publish", {
      article_ids: articleIds,
      is_published: isPublished
    });
  }

  // Bulk delete articles (admin only)
  async bulkDeleteArticles(
    articleIds: number[]
  ): Promise<MessageResponse> {
    return this.post("/bulk/delete", {
      article_ids: articleIds
    });
  }
}

export const articleService = new ArticleService();