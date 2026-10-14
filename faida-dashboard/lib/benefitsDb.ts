import { getSupabaseAdmin } from "./supabase";
import type { Benefit } from "@/types/benefit";

type BenefitRow = {
  id: string;
  name: string;
  provider: string;
  category: Benefit["category"];
  emoji: string;
  description: string;
  amount: string;
  how_to_apply: string;
  documents: string;
  deadline: string;
  deadline_date: string | null;
  deadline_annual: boolean | null;
  link: string;
  eligibility: Benefit["eligibility"];
  is_published: boolean;
  priority_weight: number;
};

export function rowToBenefit(row: BenefitRow): Benefit {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider || "",
    category: row.category,
    emoji: row.emoji || "📋",
    description: row.description || "",
    amount: row.amount || "",
    howToApply: row.how_to_apply || "",
    documents: row.documents || "",
    deadline: row.deadline || "Rolling",
    deadlineDate: row.deadline_date || undefined,
    deadlineAnnual: row.deadline_annual || undefined,
    link: row.link || "",
    eligibility: row.eligibility || {
      minAge: 18,
      maxAge: 99,
      gender: "any",
      employed: "any",
      businessOwner: "any",
      disability: "any",
      counties: ["any"],
      sectors: ["any"],
      groupRequired: false,
    },
  };
}

export function benefitToRow(benefit: Benefit): Omit<BenefitRow, "is_published" | "priority_weight"> & {
  is_published?: boolean;
  priority_weight?: number;
  updated_at: string;
} {
  return {
    id: benefit.id,
    name: benefit.name,
    provider: benefit.provider || "",
    category: benefit.category,
    emoji: benefit.emoji || "📋",
    description: benefit.description || "",
    amount: benefit.amount || "",
    how_to_apply: benefit.howToApply || "",
    documents: benefit.documents || "",
    deadline: benefit.deadline || "Rolling",
    deadline_date: benefit.deadlineDate || null,
    deadline_annual: benefit.deadlineAnnual ?? false,
    link: benefit.link || "",
    eligibility: benefit.eligibility,
    // is_published / priority_weight are omitted on purpose: new rows get the
    // DB defaults (published, weight 0) and edits keep whatever is stored.
    updated_at: new Date().toISOString(),
  };
}

export async function listBenefitsFromSupabase(): Promise<Benefit[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("benefits")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as BenefitRow[]).map(rowToBenefit);
}

export async function getBenefitFromSupabase(id: string): Promise<Benefit | undefined> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("benefits")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToBenefit(data as BenefitRow) : undefined;
}

export async function upsertBenefitInSupabase(benefit: Benefit): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  const row = benefitToRow(benefit);
  const { error } = await supabase.from("benefits").upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteBenefitFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.from("benefits").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function countBenefitsInSupabase(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("benefits")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count ?? 0;
}
