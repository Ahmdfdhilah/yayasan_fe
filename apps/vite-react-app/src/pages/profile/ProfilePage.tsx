import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectUser, selectAuthLoading, updateProfileAsync } from '@/redux/features/authSlice';
import { useToast } from '@workspace/ui/components/sonner';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { PageHeader } from '@/components/common/PageHeader';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserUpdate } from '@/services/users/types';
import { USER_STATUS, ROLE_LABELS } from '@/lib/constants';
import {
  Mail,
  Building,
  Shield,
  User as UserIcon,
  Edit,
  CheckCircle,
  XCircle,
  IdCard,
  Lock,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Data pengguna tidak ditemukan</h2>
          <p className="text-muted-foreground">Silakan login kembali.</p>
        </div>
      </div>
    );
  }

  const getFullName = () => {
    return user.profile?.name || user.display_name || user.full_name || 'N/A';
  };

  const getStatusIcon = () => {
    if (user.status !== USER_STATUS.ACTIVE) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    switch (user.status) {
      case USER_STATUS.ACTIVE:
        return 'Aktif';
      case USER_STATUS.INACTIVE:
        return 'Tidak Aktif';
      case USER_STATUS.SUSPENDED:
        return 'Ditangguhkan';
      default:
        return user.status;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (user.status) {
      case USER_STATUS.ACTIVE:
        return 'default';
      case USER_STATUS.INACTIVE:
        return 'secondary';
      case USER_STATUS.SUSPENDED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getRoleDisplayNames = () => {
    return user.roles?.map(role => ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role) || ['N/A'];
  };

  const getInitials = () => {
    const name = getFullName();
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0][0] + nameParts[1][0];
    }
    return nameParts[0][0];
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordDialogOpen(true);
  };

  const handleProfileUpdate = async (data: UserUpdate) => {
    try {
      await dispatch(updateProfileAsync(data)).unwrap();
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Data profil Anda telah diperbarui.',
        variant: 'default'
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Terjadi kesalahan saat memperbarui profil.';
      toast({
        title: 'Gagal memperbarui profil',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handlePasswordChangeSuccess = () => {
    toast({
      title: 'Password berhasil diubah',
      description: 'Password Anda telah berhasil diubah.',
      variant: 'default'
    });
    setIsPasswordDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi profil dan keamanan akun Anda"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditProfile}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profil
            </Button>
            <Button onClick={handleChangePassword}>
              <Lock className="w-4 h-4 mr-2" />
              Ganti Password
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{getFullName()}</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getStatusIcon()}
              <Badge variant={getStatusBadgeVariant()}>
                {getStatusText()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.email || 'Tidak ada email'}</span>
              </div>

              {user.profile?.phone && (
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.profile.phone}</span>
                </div>
              )}

              {user.profile?.position && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.profile.position}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {getRoleDisplayNames().map((role, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              {user.organization_id && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Organisasi ID: {user.organization_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Informasi Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Informasi Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nama Lengkap</label>
                    <p className="text-sm text-muted-foreground">{getFullName()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user.email || 'Tidak ada email'}</p>
                  </div>
                  {user.profile?.phone && (
                    <div>
                      <label className="text-sm font-medium">Nomor Telepon</label>
                      <p className="text-sm text-muted-foreground">{user.profile.phone}</p>
                    </div>
                  )}
                  {user.profile?.position && (
                    <div>
                      <label className="text-sm font-medium">Posisi/Jabatan</label>
                      <p className="text-sm text-muted-foreground">{user.profile.position}</p>
                    </div>
                  )}
                  {user.profile?.address && (
                    <div>
                      <label className="text-sm font-medium">Alamat</label>
                      <p className="text-sm text-muted-foreground">{user.profile.address}</p>
                    </div>
                  )}
                  {user.organization_id && (
                    <div>
                      <label className="text-sm font-medium">Organisasi ID</label>
                      <p className="text-sm text-muted-foreground">{user.organization_id}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Tanggal Akun dibuat</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Informasi Sistem
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Peran</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getRoleDisplayNames().map((role, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status Akun</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon()}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText()}
                      </span>
                    </div>
                  </div>

                  {user.last_login_at && (
                    <div>
                      <label className="text-sm font-medium">Login Terakhir</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(user.last_login_at)}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Data Terakhir Diupdate</label>
                    <p className="text-sm text-muted-foreground">
                      {user.updated_at ? formatDateTime(user.updated_at) : formatDateTime(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onSave={handleProfileUpdate}
        loading={isLoading}
      />

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSave={handlePasswordChangeSuccess}
        loading={isLoading}
      />
    </div>
  );
};

export default ProfilePage;