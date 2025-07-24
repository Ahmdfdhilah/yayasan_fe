import React from 'react';
import { Article } from '@/services/articles/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@workspace/ui/components/badge';

interface ArticleTableProps {
  articles: Article[];
  loading?: boolean;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onView: (article: Article) => void;
}

export const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Publikasi</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Memuat Artikel...
              </TableCell>
            </TableRow>
          ) : articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Tidak ada Artikel ditemukan
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {article.img_url && (
                      <img 
                        src={article.img_url} 
                        alt={article.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-xs text-muted-foreground">
                        <RichTextDisplay 
                          content={article.excerpt || article.description}
                          isDetailView={false}
                          maxLength={60}
                          fallback="Tidak ada ringkasan"
                        />
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{article.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={article.is_published ? 'default' : 'secondary'}>
                    {article.is_published ? 'Dipublikasikan' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {article.published_at 
                    ? format(new Date(article.published_at), 'dd MMM yyyy', { locale: id })
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {format(new Date(article.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(article)}
                    onEdit={() => onEdit(article)}
                    onDelete={() => onDelete(article)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};