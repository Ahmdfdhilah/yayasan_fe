import { useState, useEffect } from 'react';
import bgSekolah from '@/assets/bg-sekolah.webp';
import { Link } from 'react-router-dom';
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ArrowRight, Users } from 'lucide-react';
import { getOrganizationImageUrl } from '@/utils/imageUtils';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import type { Organization } from '@/services/organizations/types';
import { organizationService } from '@/services/organizations';

const OrganizationsListPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const OrganizationRowSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-8 py-12">
      <div className="lg:w-1/2">
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
      <div className="lg:w-1/2">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-8" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );

  // Load organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      try {
        const response = await organizationService.getOrganizations({
          page: 1,
          size: 100,
          sort_by: 'name',
          sort_order: 'asc'
        });

        setOrganizations(response.items);
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={bgSekolah}
            alt="Jenjang Pendidikan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center pt-24">
          <div className="max-w-screen-xl mx-auto px-4 w-full">
            <div className="max-w-3xl text-white">
              <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Yayasan Baitul Muslim Lampung Timur
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Jenjang Pendidikan
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                Berbagai jenjang pendidikan yang tersedia di Yayasan Baitul Muslim dengan fasilitas lengkap dan berkualitas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organizations List */}
      <div className="py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <OrganizationRowSkeleton key={index} />
              ))
            ) : organizations.length > 0 ? (
              organizations.map((org, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={org.id} className="py-12 first:pt-0 last:pb-0">
                    <div className={`flex flex-col lg:flex-row gap-8 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                      {/* Image Section - 50% */}
                      <div className="lg:w-1/2">
                        <div className="relative overflow-hidden rounded-lg bg-muted group">
                          <img 
                            src={getOrganizationImageUrl(org.img_url) || `https://picsum.photos/600/400?random=${index + 10}`}
                            alt={org.name}
                            className="w-full h-64 lg:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className="absolute top-4 left-4 bg-primary hover:bg-primary/90">
                            Lembaga
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content Section - 50% */}
                      <div className="lg:w-1/2 space-y-6">
                        <div>
                          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-foreground">
                            {org.display_name}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            {org.user_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{org.user_count} anggota</span>
                              </div>
                            )}
                            
                            {org.head_name && (
                              <div className="text-muted-foreground">
                                Kepala: <span className="font-medium">{org.head_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-muted-foreground leading-relaxed">
                          <RichTextDisplay 
                            content={org.description || org.excerpt}
                            fallback={`Informasi tentang ${org.name}.`}
                            maxLength={200}
                            className="text-muted-foreground"
                          />
                        </div>
                        
                        <div>
                          <Link to={`/schools/${org.id}`}>
                            <Button className="group">
                              Lihat Detail
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Tidak ada lembaga yang ditemukan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsListPage;