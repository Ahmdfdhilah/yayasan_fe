export interface RPPDashboardStats {
  total_submissions: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  pending_reviews: number;
  avg_review_time_hours: number | null;
  submission_rate: number;
}

export interface TeacherEvaluationDashboardStats {
  total_evaluations: number;
  completed_evaluations: number;
  pending_evaluations: number;
  completion_rate: number;
  avg_score: number | null;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  total_teachers: number;
  total_aspects: number;
}

export interface OrganizationSummary {
  organization_id: number;
  organization_name: string;
  total_teachers: number;
  rpp_stats: RPPDashboardStats;
  evaluation_stats: TeacherEvaluationDashboardStats;
}

export interface PeriodSummary {
  period_id: number;
  period_name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export interface QuickStats {
  my_pending_rpps: number;
  my_pending_reviews: number;
  my_pending_evaluations: number;
  recent_activities: Array<{
    type: string;
    count: number;
  }>;
}

export interface BaseDashboard {
  period: PeriodSummary;
  rpp_stats: RPPDashboardStats;
  evaluation_stats: TeacherEvaluationDashboardStats;
  organizations: OrganizationSummary[];
  user_role: "guru" | "kepala_sekolah" | "admin";
  organization_name: string | null;
  last_updated: string;
  quick_stats: QuickStats;
}

export interface TeacherDashboard extends BaseDashboard {
  user_role: "guru";
  my_rpp_stats: RPPDashboardStats;
  my_evaluation_stats: TeacherEvaluationDashboardStats;
}

export interface TeacherSummary {
  teacher_id: number;
  teacher_name: string;
  total_rpps: number;
  approved_rpps: number;
  completion_rate: number;
}

export interface OrganizationOverview {
  organization_name: string;
  total_teachers: number;
  active_teachers: number;
  head_name: string;
}

export interface PrincipalDashboard extends BaseDashboard {
  user_role: "kepala_sekolah";
  organization_overview: OrganizationOverview;
  teacher_summaries: TeacherSummary[];
}

export interface SystemOverview {
  total_users: number;
  total_organizations: number;
  system_health: string;
}

export interface SystemActivity {
  type: string;
  message: string;
}

export interface AdminDashboard extends BaseDashboard {
  user_role: "admin";
  system_overview: SystemOverview;
  organization_summaries: OrganizationSummary[];
  recent_system_activities: SystemActivity[];
}

export type DashboardResponse = TeacherDashboard | PrincipalDashboard | AdminDashboard;

export interface DashboardQueryParams {
  period_id: number;
  organization_id?: number;
  include_inactive?: boolean;
}

export interface QuickStatsQueryParams {
  period_id: number;
}