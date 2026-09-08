import Link from "next/link";
import { readBenefits } from "@/lib/benefitsIo";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/benefit";

interface SearchParams {
  category?: string;
  q?: string;
}

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const allBenefits = readBenefits();
  const activeCategory =
    searchParams.category && CATEGORIES.includes(searchParams.category as never)
      ? (searchParams.category as (typeof CATEGORIES)[number])
      : undefined;
  const query = (searchParams.q ?? "").trim().toLowerCase();

  const filtered = allBenefits.filter((b) => {
    if (activeCategory && b.category !== activeCategory) return false;
    if (query) {
      const hay =
        b.name.toLowerCase() +
        " " +
        b.provider.toLowerCase() +
        " " +
        b.description.toLowerCase() +
        " " +
        b.id.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benefits</h1>
          <p className="text-slate-600 mt-1">
            Manage the {allBenefits.length} benefits shown to citizens in the
            WhatsApp bot.
          </p>
        </div>
        <Link href="/benefits/new" className="btn-primary w-full md:w-auto">
          ＋ New Benefit
        </Link>
      </div>

      <div className="card p-4">
        <form className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <div>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by name, provider, or description..."
              className="input"
            />
          </div>
          <div>
            <select
              name="category"
              defaultValue={activeCategory ?? ""}
              className="input min-w-[160px]"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-secondary">
              🔍 Apply
            </button>
            <Link href="/benefits" className="btn-secondary">
              Clear
            </Link>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          {allBenefits.length} benefits
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Benefit</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Eligibility</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-4xl mb-2">🗂️</div>
                    <div className="text-slate-600 font-medium">
                      No benefits match your filters.
                    </div>
                    <Link
                      href="/benefits"
                      className="text-brand-600 hover:underline text-sm"
                    >
                      Reset filters
                    </Link>
                  </td>
                </tr>
              )}
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{b.emoji}</span>
                      <div>
                        <div className="font-medium text-slate-900">
                          {b.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {b.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {CATEGORY_LABELS[b.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">
                    {b.provider}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                    {b.amount}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="max-w-[180px] truncate" title={b.deadline}>
                      {b.deadline}
                    </div>
                    {b.deadlineDate && (
                      <div className="text-xs text-amber-600 font-medium">
                        📅 {b.deadlineDate}
                        {b.deadlineAnnual ? " (annual)" : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {b.eligibility.minAge}–{b.eligibility.maxAge} yrs ·
                    {b.eligibility.groupRequired ? (
                      <span className="ml-1 text-violet-700 font-medium">
                        group only
                      </span>
                    ) : (
                      <span className="ml-1">individual</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/benefits/${b.id}`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm mr-3"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/benefits/${b.id}/delete`}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
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
