import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowRight, Users, MapPin, Star } from 'lucide-react';

interface School {
  id: number;
  name: string;
  description: string;
  level?: string;
  location?: string;
  students?: number;
  rating?: number;
  imageUrl?: string;
}

interface SchoolsSectionProps {
  schools: School[];
  loading?: boolean;
}

export const SchoolsSection = ({ schools, loading }: SchoolsSectionProps) => {
  const SchoolCardSkeleton = () => (
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
    <section className="py-16">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary text-primary">
            Lembaga Pendidikan
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Jenjang Pendidikan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Berbagai jenjang pendidikan yang tersedia di Yayasan Baitul Muslim dengan fasilitas lengkap dan berkualitas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SchoolCardSkeleton key={index} />
            ))
          ) : (
            schools.slice(0, 5).map((school, index) => (
              <Card key={school.id || index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={school.imageUrl || `https://picsum.photos/400/240?random=${index + 10}`}
                    alt={school.name || `Sekolah ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
                    {school.level || 'Pendidikan'}
                  </Badge>
                  {school.rating && (
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{school.rating}</span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {school.name || `Nama Sekolah ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {school.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{school.location}</span>
                      </div>
                    )}
                    {school.students && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{school.students} siswa</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {school.description || `Informasi tentang jenjang pendidikan yang berkualitas dengan fasilitas lengkap dan tenaga pengajar profesional.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/schools/${school.id || index}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                      Lihat Detail
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        <div className="text-center">
          <Link to="/schools">
            <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground hover:border-primary">
              Lihat Semua Lembaga
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};