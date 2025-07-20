import React from 'react';
import { Period } from '@/services/periods/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Calendar, 
  BookOpen,
  CheckCircle,
  XCircle,
  FileText,
  Clock
} from 'lucide-react';

interface PeriodCardsProps {
  periods: Period[];
  loading?: boolean;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  onView: (period: Period) => void;
  onActivate?: (period: Period) => void;
  onDeactivate?: (period: Period) => void;
  canManage?: boolean;
}

export const PeriodCards: React.FC<PeriodCardsProps> = ({
  periods,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onActivate,
  onDeactivate,
  canManage = false
}) => {
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  const getStatusBadge = (period: Period) => {
    if (period.is_active) {
      return (
        <div className="flex items-center space-x-1">
          <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
          {canManage && onDeactivate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeactivate(period)}
              className="h-6 px-2 text-xs"
            >
              Nonaktifkan
            </Button>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            Tidak Aktif
          </Badge>
          {canManage && onActivate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onActivate(period)}
              className="h-6 px-2 text-xs"
            >
              Aktifkan
            </Button>
          )}
        </div>
      );
    }
  };

  const getSemesterBadge = (semester: string) => {
    const variant = semester === 'Ganjil' ? 'default' : 'secondary';
    return (
      <Badge variant={variant} className="text-xs">
        {semester}
      </Badge>
    );
  };

  const getActionProps = (period: Period) => {
    return {
      onView: () => onView(period),
      onEdit: () => onEdit(period),
      onDelete: () => onDelete(period),
      showView: true,
      showEdit: true,
      showDelete: true,
    };
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
                  <h3 className="font-medium text-sm">{period.academic_year}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getSemesterBadge(period.semester)}
                    {getStatusBadge(period)}
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