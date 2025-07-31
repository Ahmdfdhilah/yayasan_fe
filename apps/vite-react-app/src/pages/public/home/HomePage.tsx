import { useEffect, useState } from 'react';
import { 
  HeroSection, 
  StatsSection, 
  AboutSection, 
  ArticlesSection, 
  SchoolsSection 
} from '@/components/Home';

// Import services and types
import { galleryService } from '@/services/galleries';
import { articleService } from '@/services/articles';
import { organizationService } from '@/services/organizations';
import type { Gallery } from '@/services/galleries/types';
import type { Article } from '@/services/articles/types';
import type { Organization } from '@/services/organizations/types';



const HomePage = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load galleries for hero section (limit to 10, ordered by display_order)
        const galleriesResponse = await galleryService.getAllGalleries(10);
        const sortedGalleries = galleriesResponse.sort((a, b) => a.display_order - b.display_order);

        // Load articles (limit to 5, published only)
        const articlesResponse = await articleService.getArticles({
          size: 5,
          is_published: true,
          sort_by: 'published_at',
          sort_order: 'desc'
        });
        
        // Load organizations as schools (limit to 5)
        const organizationsResponse = await organizationService.getOrganizations({
          size: 5,
          sort_by: 'name',
          sort_order: 'asc'
        });
        setGalleries(sortedGalleries);
        setArticles(articlesResponse.items);
        setOrganizations(organizationsResponse.items);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection galleries={galleries} loading={loading} />
      <StatsSection />
      <AboutSection />
      <ArticlesSection articles={articles} loading={loading} />
      <SchoolsSection organizations={organizations} loading={loading} />
    </div>
  );
};

export default HomePage;