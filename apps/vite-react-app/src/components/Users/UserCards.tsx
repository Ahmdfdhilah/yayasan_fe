import React from 'react';
import { User } from '@/services/users/types';
import { UserStatus } from '@/services/auth/types';
import { getRoleDisplayName, getRoleBadgeVariant } from '@/utils/role';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Mail,
  Calendar,
  User as UserIcon,
  Phone,
  MapPin,
  Building
} from 'lucide-react';

interface UserCardsProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  disableEdit?: boolean;
  editDisabledTooltip?: string;
}

export const UserCards: React.FC<UserCardsProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView,
  disableEdit = false,
  editDisabledTooltip = 'Edit tidak tersedia'
}) => {
  const getStatusBadge = (status: UserStatus) => {
    return (
      <Badge variant={status === UserStatus.ACTIVE ? 'default' : 'destructive'} className="text-xs">
        {status === UserStatus.ACTIVE ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    );
  };


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat pengguna...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada user ditemukan
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Avatar and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm">
                    {getInitials(user.profile?.name || user.display_name || 'N')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">{user.profile?.name || user.display_name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </div>
              <ActionDropdown
                onView={() => onView(user)}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user)}
                disableEdit={disableEdit}
                editDisabledTooltip={editDisabledTooltip}
              />
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>

            {/* Position */}
            {user.profile?.position && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <UserIcon className="w-4 h-4" />
                <span>{user.profile.position}</span>
              </div>
            )}

            {/* Phone */}
            {user.profile?.phone && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Phone className="w-4 h-4" />
                <span>{user.profile.phone}</span>
              </div>
            )}

            {/* Organization */}
            {user.organization_name && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Building className="w-4 h-4" />
                <span>{user.organization_name}</span>
              </div>
            )}

            {/* Address */}
            {user.profile?.address && (
              <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{user.profile.address}</span>
              </div>
            )}

            {/* Roles */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Role:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="w-3 h-3" />
              <span>
                Dibuat: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
              </span>
              {user.last_login_at && (
                <span className="ml-auto">
                  Login: {format(new Date(user.last_login_at), 'dd MMM', { locale: id })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};