"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Benefit, BenefitEligibility } from "@/types/benefit";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/benefit";

interface Props {
  mode: "create" | "edit";
  initial?: Benefit;
}

const DEFAULT_BENEFIT: Benefit = {
  id: "",
  name: "",
  provider: "",
  category: "financial",
  emoji: "📋",
  description: "",
  amount: "",
  howToApply: "",
  documents: "",
  deadline: "Rolling",
  link: "",
  eligibility: {
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

const TRISTATE = [
  { value: "any", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const toTristate = (v: boolean | "any"): string =>
  v === true ? "true" : v === false ? "false" : "any";

const fromTristate = (v: string): boolean | "any" =>
  v === "true" ? true : v === "false" ? false : "any";

const splitList = (s: string): string[] =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export function BenefitForm({ mode, initial }: Props) {
  const router = useRouter();
  const [benefit, setBenefit] = useState<Benefit>(initial ?? DEFAULT_BENEFIT);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [countiesText, setCountiesText] = useState(
    (initial?.eligibility.counties ?? []).join(", ")
  );
  const [sectorsText, setSectorsText] = useState(
    (initial?.eligibility.sectors ?? []).join(", ")
  );

  const updateEligibility = <K extends keyof BenefitEligibility>(
    key: K,
    value: BenefitEligibility[K]
  ) => {
    setBenefit((b) => ({
      ...b,
      eligibility: { ...b.eligibility, [key]: value },
    }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: Benefit = {
        ...benefit,
        eligibility: {
          ...benefit.eligibility,
          counties:
            countiesText.trim().length === 0 ? ["any"] : splitList(countiesText),
          sectors:
            sectorsText.trim().length === 0 ? ["any"] : splitList(sectorsText),
        },
      };

      const url =
        mode === "create"
          ? "/api/benefits"
          : `/api/benefits/${encodeURIComponent(initial!.id)}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      router.push(
        `/benefits?toast=${encodeURIComponent(
          mode === "create"
            ? `Created "${payload.name}"`
            : `Saved "${payload.name}"`
        )}`
      );
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
          ⚠️ {error}
        </div>
      )}

      <section className="card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Basics</h2>
          <p className="text-sm text-slate-500">
            Core information shown at the top of benefit cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label">Benefit ID</label>
            <input
              required
              pattern="[a-z0-9-]+"
              disabled={mode === "edit"}
              value={benefit.id}
              onChange={(e) => setBenefit({ ...benefit, id: e.target.value })}
              placeholder="e.g. hustler-fund-personal"
              className="input disabled:bg-slate-50 disabled:text-slate-500"
            />
            <span className="hint">
              Lowercase letters, numbers, and hyphens only. Used internally by
              the bot.
            </span>
          </div>

          <div className="md:col-span-1">
            <label className="label">Name</label>
            <input
              required
              value={benefit.name}
              onChange={(e) => setBenefit({ ...benefit, name: e.target.value })}
              placeholder="e.g. Youth Enterprise Development Fund (YEDF)"
              className="input"
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              required
              value={benefit.category}
              onChange={(e) =>
                setBenefit({
                  ...benefit,
                  category: e.target.value as Benefit["category"],
                })
              }
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Emoji Icon</label>
            <input
              value={benefit.emoji}
              onChange={(e) =>
                setBenefit({ ...benefit, emoji: e.target.value })
              }
              placeholder="💰"
              maxLength={4}
              className="input"
            />
          </div>

          <div>
            <label className="label">Provider / Issuer</label>
            <input
              value={benefit.provider}
              onChange={(e) =>
                setBenefit({ ...benefit, provider: e.target.value })
              }
              placeholder="e.g. Government of Kenya"
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Amount / Value</label>
            <input
              value={benefit.amount}
              onChange={(e) =>
                setBenefit({ ...benefit, amount: e.target.value })
              }
              placeholder="e.g. Up to Ksh 5,000,000"
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Short Description</label>
            <textarea
              rows={3}
              value={benefit.description}
              onChange={(e) =>
                setBenefit({ ...benefit, description: e.target.value })
              }
              placeholder="Plain-language explanation of what the benefit does."
              className="input"
            />
          </div>

          <div>
            <label className="label">Deadline Text</label>
            <input
              value={benefit.deadline}
              onChange={(e) =>
                setBenefit({ ...benefit, deadline: e.target.value })
              }
              placeholder="Rolling, or 'Apply by 31 March 2026'"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deadline Date (MM-DD)</label>
              <input
                value={benefit.deadlineDate ?? ""}
                onChange={(e) =>
                  setBenefit({ ...benefit, deadlineDate: e.target.value || undefined })
                }
                placeholder="03-31"
                pattern="\d{2}-\d{2}"
                className="input"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 cursor-pointer hover:bg-slate-50 w-full h-[42px]">
                <input
                  type="checkbox"
                  checked={benefit.deadlineAnnual ?? false}
                  onChange={(e) =>
                    setBenefit({
                      ...benefit,
                      deadlineAnnual: e.target.checked || undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">
                  Repeats every year
                </span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label">Official Link</label>
            <input
              type="url"
              value={benefit.link}
              onChange={(e) => setBenefit({ ...benefit, link: e.target.value })}
              placeholder="https://example.go.ke"
              className="input"
            />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Application &amp; Documents
          </h2>
          <p className="text-sm text-slate-500">
            Populates the D# detail view and application-flow next-step hints.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label">How to Apply (step-by-step)</label>
            <textarea
              rows={5}
              value={benefit.howToApply}
              onChange={(e) =>
                setBenefit({ ...benefit, howToApply: e.target.value })
              }
              placeholder={"1. First step\n2. Second step\n3. Third step"}
              className="input font-mono text-sm"
            />
            <span className="hint">
              Use newlines for steps. The bot shows this verbatim.
            </span>
          </div>

          <div>
            <label className="label">Required Documents</label>
            <textarea
              rows={3}
              value={benefit.documents}
              onChange={(e) =>
                setBenefit({ ...benefit, documents: e.target.value })
              }
              placeholder="National ID, KRA PIN, Business registration..."
              className="input"
            />
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Eligibility Rules
          </h2>
          <p className="text-sm text-slate-500">
            Used by the matching engine to score and filter benefits. Set to
            &quot;Any&quot; for no filter on that criterion.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="label">Min Age</label>
            <input
              type="number"
              min={0}
              max={120}
              value={benefit.eligibility.minAge}
              onChange={(e) =>
                updateEligibility("minAge", Number(e.target.value) || 0)
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">Max Age</label>
            <input
              type="number"
              min={0}
              max={120}
              value={benefit.eligibility.maxAge}
              onChange={(e) =>
                updateEligibility("maxAge", Number(e.target.value) || 0)
              }
              className="input"
            />
          </div>
          <div className="col-span-2">
            <label className="label">Gender</label>
            <select
              value={benefit.eligibility.gender}
              onChange={(e) =>
                updateEligibility(
                  "gender",
                  e.target.value as BenefitEligibility["gender"]
                )
              }
              className="input"
            >
              <option value="any">Any</option>
              <option value="female">Female only</option>
              <option value="male">Male only</option>
            </select>
          </div>

          <div>
            <label className="label">Employed?</label>
            <select
              value={toTristate(benefit.eligibility.employed)}
              onChange={(e) =>
                updateEligibility("employed", fromTristate(e.target.value))
              }
              className="input"
            >
              {TRISTATE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Business Owner?</label>
            <select
              value={toTristate(benefit.eligibility.businessOwner)}
              onChange={(e) =>
                updateEligibility(
                  "businessOwner",
                  fromTristate(e.target.value)
                )
              }
              className="input"
            >
              {TRISTATE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Disability?</label>
            <select
              value={toTristate(benefit.eligibility.disability)}
              onChange={(e) =>
                updateEligibility("disability", fromTristate(e.target.value))
              }
              className="input"
            >
              {TRISTATE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Min Business Age (yrs)</label>
            <input
              type="number"
              min={0}
              value={benefit.eligibility.businessAgeMin ?? ""}
              onChange={(e) =>
                updateEligibility(
                  "businessAgeMin",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              placeholder="Optional"
              className="input"
            />
          </div>

          <div className="col-span-2">
            <label className="label flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={benefit.eligibility.groupRequired}
                onChange={(e) =>
                  updateEligibility("groupRequired", e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="!mb-0">Group Required (no individual apps)</span>
            </label>
          </div>
          <div className="col-span-2">
            <label className="label flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={benefit.eligibility.safaricomRequired ?? false}
                onChange={(e) =>
                  updateEligibility(
                    "safaricomRequired",
                    e.target.checked || undefined
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="!mb-0">
                Safaricom SIM Required (e.g. Hustler Fund)
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="label">Counties</label>
            <input
              value={countiesText}
              onChange={(e) => setCountiesText(e.target.value)}
              placeholder='any — or comma-separated: "Nairobi, Mombasa, Kisumu"'
              className="input"
            />
            <span className="hint">
              Type <code>any</code> for all counties. Otherwise list specific
              counties separated by commas.
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="label">Sectors</label>
            <input
              value={sectorsText}
              onChange={(e) => setSectorsText(e.target.value)}
              placeholder='any — or comma-separated: "tech, agriculture, services"'
              className="input"
            />
            <span className="hint">
              Leave as <code>any</code> for all sectors. Known sectors:
              tech, agriculture, services.
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-0 bg-slate-50 py-4 -mx-8 px-8 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Create Benefit"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
