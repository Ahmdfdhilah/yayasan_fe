import React from 'react';
import { Statistic } from '@/services/statistics/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { Badge } from '@workspace/ui/components/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getImageUrl } from '@/utils/imageUtils';

interface StatisticCardsProps {
  statistics: Statistic[];
  loading?: boolean;
  onEdit: (statistic: Statistic) => void;
  onDelete: (statistic: Statistic) => void;
  onView: (statistic: Statistic) => void;
}

export const StatisticCards: React.FC<StatisticCardsProps> = ({
  statistics,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (statistics.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Statistik ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {statistics.map((statistic) => (
        <Card key={statistic.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {statistic.img_url && (
                  <img
                    src={getImageUrl(statistic.img_url)}
                    alt={statistic.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium truncate">{statistic.title}</h3>
                    <Badge variant="secondary">#{statistic.display_order}</Badge>
                  </div>
                  <div className="font-semibold mb-1">
                    {statistic.stats}
                  </div>
                  {statistic.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {statistic.description}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-2">
                    Dibuat: {format(new Date(statistic.created_at), 'dd MMM yyyy', { locale: id })}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <ActionDropdown
                  onView={() => onView(statistic)}
                  onEdit={() => onEdit(statistic)}
                  onDelete={() => onDelete(statistic)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};