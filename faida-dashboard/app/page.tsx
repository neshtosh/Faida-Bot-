import { readBenefits } from "@/lib/benefitsIo";
import { CATEGORY_LABELS } from "@/types/benefit";
import Link from "next/link";
import type { FC } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  tone?: "brand" | "blue" | "amber" | "violet";
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-50 text-brand-700",
  blue: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

const StatCard: FC<StatCardProps> = ({ label, value, icon, tone = "brand" }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      </div>
      <div
        className={
          "h-10 w-10 rounded-lg flex items-center justify-center text-lg " +
          TONE_STYLES[tone]
        }
      >
        {icon}
      </div>
    </div>
  </div>
);

export default function OverviewPage() {
  const benefits = readBenefits();

  const byCategory = new Map<string, number>();
  for (const b of benefits) {
    byCategory.set(b.category, (byCategory.get(b.category) ?? 0) + 1);
  }

  const rolling = benefits.filter(
    (b) => b.deadline.toLowerCase().includes("rolling")
  ).length;
  const withDeadline = benefits.filter((b) => !!b.deadlineDate).length;
  const groupOnly = benefits.filter((b) => b.eligibility.groupRequired).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good day, Admin 👋</h1>
        <p className="text-slate-600 mt-1">
          Here&apos;s what&apos;s happening with Faida today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Benefits" value={benefits.length} icon="📋" tone="brand" />
        <StatCard label="Rolling Intakes" value={rolling} icon="🔁" tone="blue" />
        <StatCard label="Upcoming Deadlines" value={withDeadline} icon="📅" tone="amber" />
        <StatCard label="Group-Required" value={groupOnly} icon="👥" tone="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Benefits by Category</h2>
            <Link href="/benefits" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map(
              (cat) => {
                const count = byCategory.get(cat) ?? 0;
                const pct = benefits.length
                  ? Math.round((count / benefits.length) * 100)
                  : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-slate-500">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/benefits/new" className="btn-primary w-full justify-start">
              ＋ Add new benefit
            </Link>
            <Link href="/benefits" className="btn-secondary w-full justify-start">
              📋 Browse benefit catalog
            </Link>
            <a
              href="http://localhost:8787/health"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full justify-start"
            >
              🩺 Check bot health
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full justify-start"
            >
              💬 Test WhatsApp bot
            </a>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recently Added Benefits</h2>
          <Link href="/benefits" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            See all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Benefit</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Provider</th>
                <th className="py-2 pr-4 font-medium">Deadline</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {benefits.slice(0, 5).map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{b.emoji}</span>
                      <span className="font-medium text-slate-900">{b.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 ml-7">{b.id}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {CATEGORY_LABELS[b.category]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{b.provider}</td>
                  <td className="py-3 pr-4 text-slate-600">{b.deadline}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/benefits/${b.id}`}
                      className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
