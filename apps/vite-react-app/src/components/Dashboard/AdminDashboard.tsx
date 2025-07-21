import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Building, FileText, GraduationCap, Settings, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService, type AdminDashboard as AdminDashboardType } from '@/services';
import { StatCard, GradeDistribution } from './DashboardStats';

interface AdminDashboardProps {
  periodId: number;
  organizationId?: number;
}

export function AdminDashboard({ periodId, organizationId }: AdminDashboardProps) {
  const [data, setData] = useState<AdminDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getAdminDashboard({ 
          period_id: periodId,
          ...(organizationId && { organization_id: organizationId })
        });
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodId, organizationId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Periode Aktif</span>
            <Badge variant={data.period.is_active ? 'default' : 'secondary'}>
              {data.period.is_active ? 'Aktif' : 'Tidak Aktif'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Periode</p>
              <p className="font-medium">{data.period.period_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filter Organisasi</p>
              <p className="font-medium">{data.organization_name || 'Semua Organisasi'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ringkasan Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title="Total Pengguna"
              value={data.system_overview.total_users}
            />
            <StatCard
              title="Total Organisasi"
              value={data.system_overview.total_organizations}
            />
            <div>
              <p className="text-sm text-muted-foreground">Status Sistem</p>
              <Badge variant={data.system_overview.system_health === 'good' ? 'default' : 'destructive'}>
                {data.system_overview.system_health === 'good' ? 'Baik' : 'Bermasalah'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RPP Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Statistik RPP Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total RPP"
              value={data.rpp_stats.total_submissions}
            />
            <StatCard
              title="Pending Review"
              value={data.rpp_stats.pending_submissions}
              subtitle="Menunggu review"
            />
            <StatCard
              title="Disetujui"
              value={data.rpp_stats.approved_submissions}
            />
            <StatCard
              title="Tingkat Completion"
              value={Math.round(data.rpp_stats.submission_rate)}
              formatter={(v) => `${v}%`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Stats & Grade Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Statistik Evaluasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Evaluasi"
                value={data.evaluation_stats.total_evaluations}
              />
              <StatCard
                title="Selesai"
                value={data.evaluation_stats.completed_evaluations}
              />
              <StatCard
                title="Pending"
                value={data.evaluation_stats.pending_evaluations}
              />
              <StatCard
                title="Rata-rata Skor"
                value={data.evaluation_stats.avg_score || 0}
                formatter={(v) => v.toFixed(1)}
              />
            </div>
          </CardContent>
        </Card>

        <GradeDistribution distribution={data.evaluation_stats.grade_distribution} />
      </div>

      {/* Organization Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Ringkasan Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.organization_summaries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada data organisasi tersedia
              </p>
            ) : (
              <div className="grid gap-4">
                {data.organization_summaries.map((org) => (
                  <div key={org.organization_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{org.organization_name}</h4>
                      <Badge variant="outline">{org.total_teachers} Guru</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>RPP: {org.rpp_stats.total_submissions}</div>
                      <div>Approved: {org.rpp_stats.approved_submissions}</div>
                      <div>Evaluasi: {org.evaluation_stats.total_evaluations}</div>
                      <div>Avg Score: {(org.evaluation_stats.avg_score || 0).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Aktivitas Sistem Terkini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recent_system_activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada aktivitas terkini
              </p>
            ) : (
              data.recent_system_activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/users">
                <div className="text-left">
                  <div className="font-medium">Kelola Pengguna</div>
                  <div className="text-sm opacity-75">Manajemen user</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/organizations">
                <div className="text-left">
                  <div className="font-medium">Kelola Organisasi</div>
                  <div className="text-sm opacity-75">Manajemen sekolah</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/periods">
                <div className="text-left">
                  <div className="font-medium">Kelola Periode</div>
                  <div className="text-sm opacity-75">Setup periode</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/evaluation-aspects">
                <div className="text-left">
                  <div className="font-medium">Aspek Evaluasi</div>
                  <div className="text-sm opacity-75">Setup evaluasi</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}