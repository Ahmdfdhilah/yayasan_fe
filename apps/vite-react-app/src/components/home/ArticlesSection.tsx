import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowRight, Calendar, User } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  description: string;
  author?: string;
  date?: string;
  imageUrl?: string;
}

interface ArticlesSectionProps {
  articles: Article[];
  loading?: boolean;
}

export const ArticlesSection = ({ articles, loading }: ArticlesSectionProps) => {
  const ArticleCardSkeleton = () => (
    <Card>
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            Artikel & Berita
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Artikel Terbaru
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Berita dan informasi terkini seputar pendidikan dan kegiatan yayasan
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ArticleCardSkeleton key={index} />
            ))
          ) : (
            articles.slice(0, 5).map((article, index) => (
              <Card key={article.id || index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={article.imageUrl || `https://picsum.photos/400/240?random=${index + 1}`}
                    alt={article.title || `Artikel ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                    Artikel
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title || `Judul Artikel ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {article.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                    )}
                    {article.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{article.date}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {article.description || `Deskripsi artikel yang menarik dan informatif tentang berbagai topik pendidikan dan kegiatan yayasan.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/articles/${article.id || index}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                      Baca Selengkapnya
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center">
          <Link to="/articles">
            <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground hover:border-primary">
              Lihat Semua Artikel
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};