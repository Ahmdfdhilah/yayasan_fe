import React from 'react';
import { Article } from '@/services/articles/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ArticleCardsProps {
  articles: Article[];
  loading?: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onView: (article: Article) => void;
}

export const ArticleCards: React.FC<ArticleCardsProps> = ({
  articles,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const getStatus = (is_published: boolean) => {
    return is_published ? 'Dipublikasikan' : 'Draft';
  };
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Artikel ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-3 mb-2">
                  {article.img_url && (
                    <img 
                      src={article.img_url} 
                      alt={article.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">{article.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      <RichTextDisplay 
                        content={article.excerpt || article.description}
                        isDetailView={false}
                        maxLength={100}
                        fallback="Tidak ada ringkasan"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kategori:</span>
                    <span>{article.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{getStatus(article.is_published)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dibuat:</span>
                    <span>{format(new Date(article.created_at), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  
                  {article.published_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Publikasi:</span>
                      <span>{format(new Date(article.published_at), 'dd MMM yyyy', { locale: id })}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-2">
                <ActionDropdown
                  onView={() => onView(article)}
                  onEdit={() => onEdit(article)}
                  onDelete={() => onDelete(article)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};