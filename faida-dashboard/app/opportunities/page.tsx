import Link from "next/link";
import { OpportunityActions } from "@/components/OpportunityActions";
import { ScrapeNowButton } from "@/components/ScrapeNowButton";
import {
  isOpportunitiesSyncReady,
  listOpportunities,
} from "@/lib/opportunitiesDb";

interface SearchParams {
  status?: string;
}

const STATUS_TABS = [
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Live on bot" },
  { value: "rejected", label: "Rejected" },
] as const;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const activeStatus =
    STATUS_TABS.find((t) => t.value === searchParams.status)?.value ?? "pending";

  const syncReady = isOpportunitiesSyncReady();
  const opportunities = syncReady
    ? await listOpportunities(activeStatus as "pending" | "approved" | "rejected")
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live opportunities</h1>
          <p className="text-slate-600 mt-1 max-w-2xl">
            The dashboard scrapes verified sources every 12 hours. You approve items
            here — approved grants appear in the WhatsApp bot on Railway via Supabase.
          </p>
        </div>
        {syncReady ? <ScrapeNowButton /> : null}
      </div>

      {!syncReady ? (
        <div className="card p-6 border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900">Supabase required for sync</h2>
          <p className="text-sm text-amber-800 mt-2">
            Set <code className="text-xs bg-white px-1 rounded">SUPABASE_URL</code> and{" "}
            <code className="text-xs bg-white px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            in Vercel (and locally in <code className="text-xs bg-white px-1 rounded">.env.local</code>).
            Run migration{" "}
            <code className="text-xs bg-white px-1 rounded">05_scraped_opportunities.sql</code>{" "}
            in your Supabase SQL editor.
          </p>
        </div>
      ) : (
        <>
          <div className="card p-2 flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={`/opportunities?status=${tab.value}`}
                className={
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
                  (activeStatus === tab.value
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50")
                }
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="card overflow-hidden">
            {opportunities.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No {activeStatus} opportunities. Click <strong>Scrape now</strong> to fetch
                from verified RSS feeds and M-Taji.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Opportunity</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Scraped</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {opportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-slate-900">
                            {opp.emoji} {opp.name}
                          </div>
                          <div className="text-slate-500 mt-1 line-clamp-2 max-w-md">
                            {opp.description}
                          </div>
                          <a
                            href={opp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline text-xs mt-2 inline-block"
                          >
                            Open official link →
                          </a>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-600">
                          {opp.source_name}
                          <div className="text-xs text-slate-400 mt-1 capitalize">
                            {opp.category}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-500 whitespace-nowrap">
                          {new Date(opp.scraped_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <OpportunityActions id={opp.id} status={opp.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Architecture: Railway bot scrapes every 12h → Supabase (pending) → you approve
            here → bot shows approved items in WhatsApp. Use <strong>Scrape now</strong> for
            an immediate fetch. Users type{" "}
            <code className="bg-slate-100 px-1 rounded">OPPORTUNITIES</code>.
          </div>
        </>
      )}
    </div>
  );
}
