import React from 'react';
import { Organization } from '@/services/organizations/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Building, 
  Calendar,
  Users,
  User,
  FileText
} from 'lucide-react';

interface OrganizationCardsProps {
  organizations: Organization[];
  loading?: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onView: (organization: Organization) => void;
}

export const OrganizationCards: React.FC<OrganizationCardsProps> = ({
  organizations,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const getUserCountBadge = (userCount: number) => {
    return (
      <Badge variant={userCount > 0 ? 'default' : 'secondary'} className="text-xs">
        {userCount} users
      </Badge>
    );
  };

  const getHeadBadge = (headName?: string) => {
    return (
      <Badge variant={headName ? 'default' : 'outline'} className="text-xs">
        {headName || 'No head assigned'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading organizations...
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No organizations found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {organizations.map((organization) => (
        <Card key={organization.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Icon and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{organization.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getUserCountBadge(organization.user_count)}
                  </div>
                </div>
              </div>
              <ActionDropdown
                onView={() => onView(organization)}
                onEdit={() => onEdit(organization)}
                onDelete={() => onDelete(organization)}
              />
            </div>

            {/* Description */}
            {organization.description && (
              <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-2">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{organization.description}</span>
              </div>
            )}

            {/* Head */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <User className="w-4 h-4" />
              <span>{organization.head_name || 'No head assigned'}</span>
            </div>

            {/* User Count */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
              <Users className="w-4 h-4" />
              <span>{organization.user_count} users</span>
            </div>

            {/* Head Badge */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Head Status:</p>
              {getHeadBadge(organization.head_name)}
            </div>

            {/* Created At */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="w-3 h-3" />
              <span>
                Created: {format(new Date(organization.created_at), 'dd MMM yyyy', { locale: id })}
              </span>
              {organization.updated_at && (
                <span className="ml-auto">
                  Updated: {format(new Date(organization.updated_at), 'dd MMM', { locale: id })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};