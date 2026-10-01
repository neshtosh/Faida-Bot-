import * as fs from "node:fs";
import * as path from "node:path";
import type { Benefit } from "../types/benefit";
import {
  deleteBenefitFromSupabase,
  getBenefitFromSupabase,
  listBenefitsFromSupabase,
  upsertBenefitInSupabase,
} from "./benefitsDb";
import { isSupabaseConfigured } from "./supabase";

function defaultBenefitsPath(): string {
  if (process.env.FAIDA_BENEFITS_JSON) {
    return path.resolve(process.env.FAIDA_BENEFITS_JSON);
  }
  return path.resolve(process.cwd(), "../faida-export/src/db/benefits.json");
}

const BENEFITS_JSON_PATH = defaultBenefitsPath();

export function resolveBenefitsPath(): string {
  return BENEFITS_JSON_PATH;
}

function readBenefitsFromJson(): Benefit[] {
  const raw = fs.readFileSync(BENEFITS_JSON_PATH, "utf-8");
  return JSON.parse(raw) as Benefit[];
}

function writeBenefitsToJson(benefits: Benefit[]): void {
  const json = JSON.stringify(benefits, null, 2);
  fs.writeFileSync(BENEFITS_JSON_PATH, json + "\n", "utf-8");
}

export function usesSupabaseBenefits(): boolean {
  return isSupabaseConfigured();
}

export async function readBenefits(): Promise<Benefit[]> {
  if (isSupabaseConfigured()) {
    return listBenefitsFromSupabase();
  }
  return readBenefitsFromJson();
}

export async function getBenefitById(id: string): Promise<Benefit | undefined> {
  if (isSupabaseConfigured()) {
    return getBenefitFromSupabase(id);
  }
  return readBenefitsFromJson().find((b) => b.id === id);
}

export async function upsertBenefit(benefit: Benefit): Promise<void> {
  if (isSupabaseConfigured()) {
    await upsertBenefitInSupabase(benefit);
    return;
  }
  const all = readBenefitsFromJson();
  const idx = all.findIndex((b) => b.id === benefit.id);
  if (idx >= 0) all[idx] = benefit;
  else all.push(benefit);
  writeBenefitsToJson(all);
}

export async function deleteBenefitById(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return deleteBenefitFromSupabase(id);
  }
  const all = readBenefitsFromJson();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  writeBenefitsToJson(next);
  return true;
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
