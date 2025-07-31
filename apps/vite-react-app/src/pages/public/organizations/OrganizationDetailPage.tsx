import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ArrowLeft, Users, Share2, Calendar } from 'lucide-react';
import { getOrganizationImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Organization } from '@/services/organizations/types';
import { organizationService } from '@/services/organizations';

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadOrganization = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const org = await organizationService.getOrganizationById(parseInt(id));
        setOrganization(org);
      } catch (err) {
        console.error('Error loading organization:', err);
        setError('Gagal memuat informasi lembaga');
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && organization) {
      try {
        await navigator.share({
          title: organization.display_name,
          text: organization.description || organization.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-muted/20">
        <div className="mx-auto px-4 lg:px-12 py-">
          <Link to="/schools">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Lembaga
            </Button>
          </Link>
        </div>
      </div>

      {/* Organization Content */}
      <div className="mx-auto px-4 lg:px-12 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Lembaga Pendidikan
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="ml-auto"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
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
        <footer className="border-t pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Bagikan:</span>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan Lembaga
              </Button>
            </div>
            
            <Link to="/schools">
              <Button variant="outline">
                Lihat Lembaga Lainnya
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;