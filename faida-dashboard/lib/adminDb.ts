import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { readBenefits } from "./benefitsIo";
import type {
  ApplicationRow,
  ApplicationStatus,
  DashboardStats,
  UserRow,
} from "@/types/admin";

async function benefitNameMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const b of await readBenefits()) {
    map.set(b.id, b.name);
  }
  return map;
}

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  users?: number;
  applications?: number;
  benefits?: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, message: "Could not create Supabase client." };
  }

  const { count: userCount, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (usersError) {
    return { ok: false, message: usersError.message };
  }

  const { count: appCount, error: appsError } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  if (appsError) {
    return { ok: false, message: appsError.message };
  }

  const { count: benefitCount, error: benefitsError } = await supabase
    .from("benefits")
    .select("*", { count: "exact", head: true });

  if (benefitsError) {
    return { ok: false, message: benefitsError.message };
  }

  return {
    ok: true,
    message: "Connected to Supabase.",
    users: userCount ?? 0,
    applications: appCount ?? 0,
    benefits: benefitCount ?? 0,
  };
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalApplications },
    { count: applicationsLast7Days },
    { count: activeUsersLast7Days },
    { count: remindersOptIn },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("completed_at", weekAgo),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", weekAgo),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("reminder_opt_in", true),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalApplications: totalApplications ?? 0,
    applicationsLast7Days: applicationsLast7Days ?? 0,
    activeUsersLast7Days: activeUsersLast7Days ?? 0,
    remindersOptIn: remindersOptIn ?? 0,
  };
}

export async function listApplications(options?: {
  status?: ApplicationStatus;
  benefitId?: string;
  limit?: number;
}): Promise<ApplicationRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("applications")
    .select("*")
    .order("completed_at", { ascending: false })
    .limit(options?.limit ?? 200);

  if (options?.status) query = query.eq("status", options.status);
  if (options?.benefitId) query = query.eq("benefit_id", options.benefitId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const names = await benefitNameMap();
  return (data || []).map((row) => ({
    ...(row as ApplicationRow),
    benefit_name: names.get(row.benefit_id) || row.benefit_id,
  }));
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Application not found.");
}

export async function listUsers(limit = 200): Promise<UserRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as UserRow[];
}

export function applicationsToCsv(rows: ApplicationRow[]): string {
  const header = [
    "reference_code",
    "benefit_id",
    "benefit_name",
    "status",
    "user_id_hash",
    "completed_at",
    "submission_mode",
  ];
  const lines = rows.map((r) =>
    [
      r.reference_code,
      r.benefit_id,
      r.benefit_name || "",
      r.status,
      r.user_id_hash,
      r.completed_at,
      r.submission_mode || "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export { isSupabaseConfigured };
