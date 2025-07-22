import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Building, FileText, GraduationCap, HomeIcon } from 'lucide-react';
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
      {data.period && (
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5" />
            Ringkasan Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <StatCard
              title="Total Pengguna"
              value={data.system_overview.total_users || 0}
            />
            <StatCard
              title="Total Sekolah"
              value={data.system_overview.total_organizations || 0}
            />
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
                title="Rata-rata Skor"
                value={data.evaluation_stats.avg_score || 0}
                formatter={(v) => v.toFixed(1)}
              />
            </div>
          </CardContent>
        </Card>

        {data.evaluation_stats.grade_distribution && Object.keys(data.evaluation_stats.grade_distribution).length > 0 && (
          <GradeDistribution distribution={data.evaluation_stats.grade_distribution} />
        )}
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
                      <Badge variant="outline">{org.total_teachers || 0} Guru</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>RPP: {org.rpp_stats?.total_submissions || 0}</div>
                      <div>Approved: {org.rpp_stats?.approved_submissions || 0}</div>
                      <div>Evaluasi: {org.evaluation_stats?.total_evaluations || 0}</div>
                      <div>Avg Score: {(org.evaluation_stats?.avg_score || 0).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}