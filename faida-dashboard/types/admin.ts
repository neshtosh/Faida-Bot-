export type ApplicationStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "withdrawn";

export type ApplicationRow = {
  id: string;
  user_id_hash: string;
  benefit_id: string;
  benefit_name?: string;
  template_id: string | null;
  reference_code: string;
  status: ApplicationStatus;
  started_at: string;
  completed_at: string;
  submission_mode: string | null;
  answers_summary: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export type UserRow = {
  user_id_hash: string;
  language: string | null;
  first_seen_at: string;
  last_seen_at: string;
  reminder_opt_in: boolean;
  app_count: number;
  match_count: number;
  profile_snapshot: {
    age?: number;
    gender?: string;
    county?: string;
    sector?: string;
    employed?: boolean | string;
    businessOwner?: boolean | string;
  };
};

export type DashboardStats = {
  totalUsers: number;
  totalApplications: number;
  applicationsLast7Days: number;
  activeUsersLast7Days: number;
  remindersOptIn: number;
};
