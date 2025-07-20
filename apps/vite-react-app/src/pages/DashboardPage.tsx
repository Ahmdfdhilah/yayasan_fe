// apps/vite-react-app/src/pages/DashboardPage.tsx
import { useAuth } from '@/components/Auth/AuthProvider';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Calendar, Users, FileText, GraduationCap, Building, Settings } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { 
    currentRole, 
    allRoles, 
    isAdmin, 
    isGuru, 
    isKepalaSekolah,
    canManageUsers,
    canEvaluateTeachers,
    canSubmitRPP,
    canReviewRPP
  } = useRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard PKG System</h1>
          <p className="text-muted-foreground">
            Selamat datang di Sistem Penilaian Kinerja Guru
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informasi Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
              <p className="text-lg">{user?.profile?.name || user?.display_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Pengguna</p>
              <p className="text-lg">{user?.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={user?.status === 'active' ? 'default' : 'secondary'}>
                {user?.status || 'N/A'}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Peran</p>
            <div className="flex flex-wrap gap-2">
              {allRoles.map((role) => (
                <Badge key={role} variant="outline">
                  {role === 'admin' ? 'Administrator' : 
                   role === 'guru' ? 'Guru' : 
                   role === 'kepala_sekolah' ? 'Kepala Sekolah' : role}
                </Badge>
              ))}
            </div>
          </div>

          {user?.organization_id && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Organisasi</p>
              <p className="text-lg">{user.organization_id}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-based Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Admin Actions */}
        {isAdmin() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manajemen User
                </CardTitle>
                <CardDescription>
                  Kelola pengguna sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Kelola User (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Manajemen Organisasi
                </CardTitle>
                <CardDescription>
                  Kelola sekolah dan organisasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Kelola Organisasi (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pengaturan Sistem
                </CardTitle>
                <CardDescription>
                  Konfigurasi sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Pengaturan (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Kepala Sekolah Actions */}
        {isKepalaSekolah() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Evaluasi Guru
                </CardTitle>
                <CardDescription>
                  Lakukan penilaian kinerja guru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Evaluasi Guru (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Review RPP
                </CardTitle>
                <CardDescription>
                  Review dan setujui RPP guru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Review RPP (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Guru Actions */}
        {isGuru() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload RPP
              </CardTitle>
              <CardDescription>
                Submit rencana pelaksanaan pembelajaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Upload RPP (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Common Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Periode Aktif
            </CardTitle>
            <CardDescription>
              Lihat periode evaluasi dan RPP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Lihat Periode (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug: Izin Pengguna</CardTitle>
          <CardDescription>
            Informasi untuk debugging (akan dihapus di production)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Peran Utama:</strong> {currentRole}</p>
              <p><strong>Semua Peran:</strong> {allRoles.join(', ')}</p>
              <p><strong>Is Admin:</strong> {isAdmin() ? 'Ya' : 'Tidak'}</p>
              <p><strong>Is Guru:</strong> {isGuru() ? 'Ya' : 'Tidak'}</p>
              <p><strong>Is Kepala Sekolah:</strong> {isKepalaSekolah() ? 'Ya' : 'Tidak'}</p>
            </div>
            <div>
              <p><strong>Dapat Kelola User:</strong> {canManageUsers() ? 'Ya' : 'Tidak'}</p>
              <p><strong>Dapat Evaluasi Guru:</strong> {canEvaluateTeachers() ? 'Ya' : 'Tidak'}</p>
              <p><strong>Dapat Submit RPP:</strong> {canSubmitRPP() ? 'Ya' : 'Tidak'}</p>
              <p><strong>Dapat Review RPP:</strong> {canReviewRPP() ? 'Ya' : 'Tidak'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw User Data */}
      <Card>
        <CardHeader>
          <CardTitle>Debug: Data User Mentah</CardTitle>
          <CardDescription>
            Data user dari Redux store (akan dihapus di production)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}