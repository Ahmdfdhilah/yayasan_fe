import React from 'react';
import { Period } from '@/services/periods/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Calendar, 
  BookOpen,
  FileText,
  Clock
} from 'lucide-react';

interface PeriodCardsProps {
  periods: Period[];
  loading?: boolean;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  onView: (period: Period) => void;
}

export const PeriodCards: React.FC<PeriodCardsProps> = ({
  periods,
  loading = false,
  onEdit,
  onDelete,
  onView,
}) => {
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };



  const getActionProps = (period: Period) => {
    const props: any = {
      onView: () => onView(period),
      onEdit: () => onEdit(period),
      onDelete: () => onDelete(period),
      showView: true,
      showEdit: true,
      showDelete: true,
    };

    return props;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat periode...
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada periode ditemukan
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {periods.map((period) => (
        <Card key={period.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Icon and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{period.academic_year} - {period.semester}</h3>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: {period.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </div>
                </div>
              </div>
              
              <ActionDropdown
                {...getActionProps(period)}
              />
            </div>

            {/* Period Information */}
            <div className="space-y-2">
              {/* Date Range */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(period.start_date)} - {formatDate(period.end_date)}</span>
              </div>

              {/* Description */}
              {period.description && (
                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="line-clamp-2">
                    {period.description}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Dibuat: {formatDate(period.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};