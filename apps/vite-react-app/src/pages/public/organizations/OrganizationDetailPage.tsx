import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, Users, Calendar } from 'lucide-react';
import { getOrganizationImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { AutoScrollCarousel } from '@/components/common/AutoScrollCarousel';
import { DetailPageHeader } from '@/components/common/DetailPageHeader';
import { DetailPageFooter } from '@/components/common/DetailPageFooter';
import { useShareHandler } from '@/hooks/useShareHandler';
import type { Organization } from '@/services/organizations/types';
import { organizationService } from '@/services/organizations';

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOrganizations, setRelatedOrganizations] = useState<Organization[]>([]);
  const handleShare = useShareHandler();

  useEffect(() => {
    if (!id) return;

    const loadOrganization = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const org = await organizationService.getOrganizationById(parseInt(id));
        setOrganization(org);
        
        // Load related organizations (exclude current one)
        const orgResponse = await organizationService.getOrganizations({
          size: 12
        });
        
        const related = orgResponse.items
          .filter(o => o.id !== org.id)
          .slice(0, 9);
        
        setRelatedOrganizations(related);
      } catch (err) {
        console.error('Error loading organization:', err);
        setError('Gagal memuat informasi lembaga');
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

  const onShare = () => {
    if (organization) {
      handleShare({
        title: organization.display_name,
        text: organization.description || organization.excerpt,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="mx-auto px-4 lg:px-12 py-12">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Lembaga Tidak Ditemukan'}
          </h1>
          <p className="text-muted-foreground mb-6">
            Lembaga yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link to="/schools">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Lembaga
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Back Navigation */}
      <DetailPageHeader 
        backLabel="Kembali ke Lembaga"
        backPath="/schools"
        onShare={onShare}
      />

      {/* Organization Content */}
      <div className="mx-auto px-4 lg:px-12 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Lembaga Pendidikan
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {organization.display_name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {organization.user_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{organization.user_count} anggota</span>
              </div>
            )}
            {organization.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Dibuat {new Date(organization.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {organization.head_name && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium">Kepala Lembaga:</span> {organization.head_name}
              </p>
            </div>
          )}
        </header>

        {/* Featured Image */}
        {organization.img_url && (
          <div className="aspect-video relative overflow-hidden rounded-lg mb-8 bg-muted">
            <img 
              src={getOrganizationImageUrl(organization.img_url)}
              alt={organization.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tentang {organization.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <RichTextDisplay 
                    content={organization.description || organization.excerpt}
                    isDetailView={true}
                    fallback={`Informasi tentang ${organization.name} belum tersedia.`}
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          {/* <div className="lg:col-span-1"> */}

            {/* Statistics */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organization.user_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Anggota</span>
                    <span className="font-semibold text-foreground">{organization.user_count}</span>
                  </div>
                )} */}
                
                {/* {organization.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tahun Berdiri</span>
                    <span className="font-semibold text-foreground">
                      {new Date(organization.created_at).getFullYear()}
                    </span>
                  </div>
                )}
                 */}
                 {/* TODO */}
              {/* </CardContent>
            </Card> */}
          {/* </div> */}
        </div>

        {/* Footer */}
        <div className="mt-12">
          <DetailPageFooter 
            onShare={onShare}
            shareLabel="Bagikan Lembaga"
            backPath="/schools"
            backLabel="Lihat Lembaga Lainnya"
          />
        </div>
      </div>

      {/* Related Organizations */}
      {relatedOrganizations.length > 0 && (
        <section className="bg-muted/20 py-16">
          <div className="mx-auto px-4 lg:px-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Lembaga Lainnya
              </h2>
            </div>
            <AutoScrollCarousel
              items={relatedOrganizations}
              autoScrollInterval={4500}
              showControls={true}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                large: 3
              }}
              className="mb-8"
              renderItem={(relatedOrg, index) => (
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    <img 
                      src={getOrganizationImageUrl(relatedOrg.img_url) || `https://picsum.photos/320/180?random=${index + 200}`}
                      alt={relatedOrg.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col h-32">
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm flex-grow">
                      {relatedOrg.display_name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      {relatedOrg.user_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{relatedOrg.user_count} anggota</span>
                        </div>
                      )}
                    </div>
                    <Link to={`/schools/${relatedOrg.id}`} className="mt-auto">
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary text-xs">
                        Lihat Detail
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default OrganizationDetailPage;