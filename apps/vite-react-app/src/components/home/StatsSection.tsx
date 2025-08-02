import { useState, useEffect } from 'react';
import { Card, CardContent } from "@workspace/ui/components/card";
import { statisticService } from '@/services/statistics';
import { StatisticResponse } from '@/services/statistics/types';
import { getImageUrl } from '@/utils/imageUtils';


export const StatsSection = () => {
  const [statistics, setStatistics] = useState<StatisticResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await statisticService.getPublicStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
                  </div>
                  <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-5 bg-muted animate-pulse rounded mb-1"></div>
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (statistics.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat) => (
            <Card key={stat.id} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {stat.img_url && (
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4  overflow-hidden">
                    <img
                      src={getImageUrl(stat.img_url)}
                      alt={stat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-3xl font-bold text-primary mb-2">{stat.stats}</div>
                <div className="font-semibold text-foreground mb-1">{stat.title}</div>
                {stat.description && (
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};