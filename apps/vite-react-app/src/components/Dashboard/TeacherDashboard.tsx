import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { FileText, GraduationCap } from 'lucide-react';
import { dashboardService, type TeacherDashboard as TeacherDashboardType } from '@/services';
import { StatCard, GradeDistribution } from './DashboardStats';

interface TeacherDashboardProps {
  periodId: number;
}

export function TeacherDashboard({ periodId }: TeacherDashboardProps) {
  const [data, setData] = useState<TeacherDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getTeacherDashboard({ period_id: periodId });
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
              <div>
                <p className="text-sm text-muted-foreground">Sekolah</p>
                <p className="font-medium">{data.organization_name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My RPP Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Statistik Submission Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Submission"
              value={data.my_rpp_stats.total_submissions}
              subtitle='Jumlah Submission'
            />
            <StatCard
              title="Disetujui"
              value={data.my_rpp_stats.approved_submissions}
              subtitle="Submission yang disetujui"
            />
            <StatCard
              title="Pending"
              value={data.my_rpp_stats.pending_submissions}
              subtitle="Submission yang Menunggu review"
            />
            <StatCard
              title="Tingkat Penyelesaian"
              value={Math.round(data.my_rpp_stats.submission_rate)}
              formatter={(v) => `${v}%`}
            />
          </div>
        </CardContent>
      </Card>

      {/* My Evaluation Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Statistik Evaluasi Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Evaluasi"
                value={data.my_evaluation_stats.total_evaluations}
              />
              <StatCard
                title="Rata-rata Skor"
                value={data.my_evaluation_stats.avg_score || 0}
                formatter={(v) => v.toFixed(1)}
              />
              {data.my_evaluation_stats.avg_total_score !== null && (
                <StatCard
                  title="Rata-rata Total"
                  value={data.my_evaluation_stats.avg_total_score}
                  formatter={(v) => v.toFixed(1)}
                />
              )}
              {data.my_evaluation_stats.avg_final_score !== null && (
                <StatCard
                  title="Rata-rata Final"
                  value={data.my_evaluation_stats.avg_final_score}
                  formatter={(v) => v.toFixed(1)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {data.my_evaluation_stats.grade_distribution && Object.keys(data.my_evaluation_stats.grade_distribution).length > 0 && (
          <GradeDistribution distribution={data.my_evaluation_stats.grade_distribution} />
        )}
      </div>

    </div>
  );
}