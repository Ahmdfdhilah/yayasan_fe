import React from 'react';
import { Organization } from '@/services/organizations/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Building, Users, User } from 'lucide-react';

interface OrganizationTableProps {
  organizations: Organization[];
  loading?: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onView: (organization: Organization) => void;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const getUserCountBadge = (userCount: number) => {
    return (
      <Badge variant={userCount > 0 ? 'default' : 'secondary'} className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        {userCount}
      </Badge>
    );
  };

  const getHeadBadge = (headName?: string) => {
    return (
      <Badge variant={headName ? 'default' : 'outline'} className="flex items-center gap-1">
        <User className="w-3 h-3" />
        {headName || 'No head'}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Head</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Loading organizations...
              </TableCell>
            </TableRow>
          ) : organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No organizations found
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">{organization.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {organization.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {organization.description ? (
                      <span className="line-clamp-2">{organization.description}</span>
                    ) : (
                      <span className="text-muted-foreground italic">No description</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  {getHeadBadge(organization.head_name)}
                </TableCell>
                <TableCell>
                  {getUserCountBadge(organization.user_count)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(organization.created_at), 'dd MMM yyyy', { locale: id })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(organization)}
                    onEdit={() => onEdit(organization)}
                    onDelete={() => onDelete(organization)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};