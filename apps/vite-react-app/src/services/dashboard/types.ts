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
  avg_score: number | null;
  avg_total_score: number | null;
  avg_final_score: number | null;
  grade_distribution: Record<string, number>;
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


export interface DashboardResponse {
  period: PeriodSummary | null;
  rpp_stats: RPPDashboardStats;
  evaluation_stats: TeacherEvaluationDashboardStats;
  organizations: OrganizationSummary[] | null;
  user_role: string;
  organization_name: string | null;
  last_updated: string;
}

export interface TeacherDashboard extends DashboardResponse {
  my_rpp_stats: RPPDashboardStats;
  my_evaluation_stats: TeacherEvaluationDashboardStats;
}


export interface OrganizationOverview extends Record<string, any> {
  organization_name: string;
  total_teachers: number;
}

export interface PrincipalDashboard extends DashboardResponse {
  organization_overview: Record<string, any>;
  teacher_summaries: Array<Record<string, any>>;
}

export interface AdminDashboard extends DashboardResponse {
  system_overview: Record<string, any>;
  organization_summaries: OrganizationSummary[];
  organization_distribution: Record<string, Record<string, number>>;
  recent_system_activities: Array<Record<string, any>>;
}

export type DashboardUnion = TeacherDashboard | PrincipalDashboard | AdminDashboard;

export interface DashboardFilters {
  period_id: number;
  organization_id?: number;
  include_inactive?: boolean;
}

export interface DashboardQueryParams extends DashboardFilters {}

export interface QuickStatsQueryParams {
  period_id: number;
}