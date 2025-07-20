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
// import { ChangePasswordDialog } from '@/components/profile/ChangePasswordDialog';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserUpdate } from '@/services/users/types';
import {
  Mail,
  Building,
  Shield,
  User as UserIcon,
  Edit,
  CheckCircle,
  XCircle,
  IdCard,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

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
    return user.nama;
  };

  const getStatusIcon = () => {
    if (!user.is_active) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!user.is_active) return 'Tidak Aktif';
    return 'Aktif';
  };

  const getStatusBadgeVariant = () => {
    if (!user.is_active) return 'destructive';
    return 'default';
  };

  const getRoleDisplayName = () => {
    return user.role_display || user.role;
  };

  const getInitials = () => {
    const nameParts = user.nama.split(' ');
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

  // const handleChangePassword = () => {
  //   setIsPasswordDialogOpen(true);
  // };

  const handleProfileUpdate = async (data: UserUpdate) => {
    try {
      await dispatch(updateProfileAsync(data)).unwrap();
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Data profil Anda telah diperbarui.',
        variant: 'default'
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Gagal memperbarui profil',
        description: 'Terjadi kesalahan saat memperbarui profil.',
        variant: 'destructive'
      });
    }
  };

  // const handlePasswordChange = async (data: UserChangePassword) => {
  //   try {
  //     await dispatch(changePasswordAsync(data)).unwrap();
  //     toast({
  //       title: 'Password berhasil diubah',
  //       description: 'Password Anda telah berhasil diubah.',
  //       variant: 'default'
  //     });
  //     setIsPasswordDialogOpen(false);
  //   } catch (error) {
  //     toast({
  //       title: 'Gagal mengubah password',
  //       description: 'Terjadi kesalahan saat mengubah password.',
  //       variant: 'destructive'
  //     });
  //   }
  // };

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
            {/* <Button onClick={handleChangePassword}>
              <Lock className="w-4 h-4 mr-2" />
              Ganti Password
            </Button> */}
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

              <div className="flex items-center gap-2">
                <IdCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{user.username}</span>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{getRoleDisplayName()}</span>
              </div>
              {user.inspektorat && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.inspektorat}</span>
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
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-sm text-muted-foreground">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user.email || 'Tidak ada email'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Jabatan</label>
                    <p className="text-sm text-muted-foreground">{user.jabatan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tanggal Bergabung</label>
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
                      <Badge variant="secondary" className="text-xs">
                        {getRoleDisplayName()}
                      </Badge>
                    </div>
                  </div>
                  {user.inspektorat && (
                    <div>
                      <label className="text-sm font-medium">Inspektorat</label>
                      <p className="text-sm text-muted-foreground">{user.inspektorat}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Status Email</label>
                    <div className="flex items-center gap-2">
                      {user.has_email ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {user.has_email ? 'Memiliki email' : 'Tidak memiliki email'}
                      </span>
                    </div>
                  </div>
                  {user.last_login && (
                    <div>
                      <label className="text-sm font-medium">Login Terakhir</label>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(user.last_login)}
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

        {/* Security Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Informasi Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {user.has_email ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Status Email</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.has_email ? 'Email tersedia' : 'Email tidak tersedia'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Status Akun</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.is_active ? 'Akun aktif' : 'Akun tidak aktif'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Password Status</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password aman
                </p>
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

      {/* <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSave={handlePasswordChange}
        loading={isLoading}
      /> */}
    </div>
  );
};

export default ProfilePage;