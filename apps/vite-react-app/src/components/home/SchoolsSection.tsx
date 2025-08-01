import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowRight, Users } from 'lucide-react';
import { AutoScrollCarousel } from '@/components/common/AutoScrollCarousel';
import { getOrganizationImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Organization } from '@/services/organizations/types';

interface SchoolsSectionProps {
  organizations: Organization[];
  loading?: boolean;
}

export const SchoolsSection = ({ organizations, loading }: SchoolsSectionProps) => {
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

  const renderSchoolCard = (org: Organization, index: number) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full">
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
        <img 
          src={getOrganizationImageUrl(org.img_url) || `https://picsum.photos/400/240?random=${index + 10}`}
          alt={org.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90">
          Organisasi
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
          {org.display_name}
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {org.user_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{org.user_count} anggota</span>
            </div>
          )}
          {org.head_name && (
            <div className="text-xs">
              Kepala: {org.head_name}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="text-muted-foreground line-clamp-3 leading-relaxed">
          <RichTextDisplay 
            content={org.description || org.excerpt}
            fallback={`Informasi tentang organisasi ${org.name}.`}
            maxLength={120}
            className="text-muted-foreground"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/organizations/${org.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
            Lihat Detail
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
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
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <SchoolCardSkeleton key={index} />
            ))}
          </div>
        ) : organizations.length > 3 ? (
          <div className="mb-8">
            <AutoScrollCarousel
              items={organizations.slice(0, 6)}
              renderItem={renderSchoolCard}
              autoScrollInterval={6000}
              showControls={true}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                large: 3
              }}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {organizations.slice(0, 5).map((org, index) => (
              <div key={org.id}>
                {renderSchoolCard(org, index)}
              </div>
            ))}
          </div>
        )}
        
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