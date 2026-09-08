import * as fs from "node:fs";
import * as path from "node:path";
import type { Benefit } from "../types/benefit";

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

export function readBenefits(): Benefit[] {
  const raw = fs.readFileSync(BENEFITS_JSON_PATH, "utf-8");
  return JSON.parse(raw) as Benefit[];
}

export function writeBenefits(benefits: Benefit[]): void {
  const json = JSON.stringify(benefits, null, 2);
  fs.writeFileSync(BENEFITS_JSON_PATH, json + "\n", "utf-8");
}

export function getBenefitById(id: string): Benefit | undefined {
  return readBenefits().find((b) => b.id === id);
}

export function upsertBenefit(benefit: Benefit): void {
  const all = readBenefits();
  const idx = all.findIndex((b) => b.id === benefit.id);
  if (idx >= 0) {
    all[idx] = benefit;
  } else {
    all.push(benefit);
  }
  writeBenefits(all);
}

export function deleteBenefitById(id: string): boolean {
  const all = readBenefits();
  const next = all.filter((b) => b.id !== id);
  if (next.length === all.length) return false;
  writeBenefits(next);
  return true;
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
