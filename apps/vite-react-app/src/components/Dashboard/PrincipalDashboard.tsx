import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Building, Users, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService, type PrincipalDashboard as PrincipalDashboardType } from '@/services';
import { StatCard, GradeDistribution } from './DashboardStats';

interface PrincipalDashboardProps {
  periodId: number;
}

export function PrincipalDashboard({ periodId }: PrincipalDashboardProps) {
  const [data, setData] = useState<PrincipalDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getPrincipalDashboard({ period_id: periodId });
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
              <p className="text-sm text-muted-foreground">Organisasi</p>
              <p className="font-medium">{data.organization_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Ringkasan Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title="Total Guru"
              value={data.organization_overview.total_teachers}
            />
            <StatCard
              title="Guru Aktif"
              value={data.organization_overview.active_teachers}
            />
          </div>
        </CardContent>
      </Card>

      {/* RPP Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Statistik RPP Organisasi
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
              Statistik Evaluasi
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

      {/* Teacher Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ringkasan Guru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.teacher_summaries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada data guru tersedia
              </p>
            ) : (
              <div className="grid gap-4">
                {data.teacher_summaries.map((teacher) => (
                  <div key={teacher.teacher_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.teacher_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.total_rpps} RPP total, {teacher.approved_rpps} disetujui
                      </p>
                    </div>
                    <Badge
                      variant={teacher.completion_rate >= 80 ? 'default' :
                        teacher.completion_rate >= 60 ? 'secondary' : 'destructive'}
                    >
                      {Math.round(teacher.completion_rate)}%
                    </Badge>
                  </div>
                ))}
              </div>
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
          <div className="grid md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/rpp-submissions">
                <div className="text-left">
                  <div className="font-medium">Review RPP</div>
                  <div className="text-sm opacity-75">
                    {data.rpp_stats.pending_submissions} pending
                  </div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/teacher-evaluations">
                <div className="text-left">
                  <div className="font-medium">Evaluasi Guru</div>
                  <div className="text-sm opacity-75">Kelola evaluasi</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/users">
                <div className="text-left">
                  <div className="font-medium">Manajemen Guru</div>
                  <div className="text-sm opacity-75">Kelola guru</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}