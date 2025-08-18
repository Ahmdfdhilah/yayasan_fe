// apps/vite-react-app/src/pages/dashboard/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Calendar, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TeacherDashboard, PrincipalDashboard, AdminDashboard } from '@/components/Dashboard';
import { periodService, type Period } from '@/services';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { currentRole, isAdmin, isGuru, isKepalaSekolah } = useRole();

  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);

  // Fetch periods on component mount
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setPeriodsLoading(true);
        const response = await periodService.getPeriods({ page: 1, limit: 50 });
        const activePeriods = response.items.filter(p => p.is_active);
        setPeriods(response.items);

        // Auto-select first active period or first period
        if (activePeriods.length > 0) {
          setSelectedPeriodId(activePeriods[0].id);
        } else if (response.items.length > 0) {
          setSelectedPeriodId(response.items[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch periods:', error);
      } finally {
        setPeriodsLoading(false);
      }
    };

    fetchPeriods();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrator';
      case 'ADMIN': return 'Administrator';
      case 'GURU': return 'Guru';
      case 'KEPALA_SEKOLAH': return 'Kepala Sekolah';
      default: return role;
    }
  };

  const renderDashboardContent = () => {
    if (!selectedPeriodId) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {periodsLoading ? 'Loading periods...' : 'Silakan pilih periode untuk melihat dashboard'}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (isGuru()) {
      return <TeacherDashboard periodId={selectedPeriodId} />;
    }

    if (isKepalaSekolah()) {
      return <PrincipalDashboard periodId={selectedPeriodId} />;
    }

    if (isAdmin()) {
      return <AdminDashboard periodId={selectedPeriodId} />;
    }

    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Role tidak dikenali</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang, {user?.profile?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedPeriodId?.toString() || ''}
              onValueChange={(value) => setSelectedPeriodId(parseInt(value))}
              disabled={periodsLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{period.academic_year} - {period.semester}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button asChild variant="default">
            <Link to="/profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </Link>
          </Button>

          <Button variant="destructive" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
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
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peran</p>
              {getRoleDisplayName(currentRole)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based Dashboard Content */}
      {renderDashboardContent()}
    </div>
  );
}