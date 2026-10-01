import Link from "next/link";
import { ApplicationStatusSelect } from "@/components/ApplicationStatusSelect";

export const dynamic = "force-dynamic";
import { SupabaseNotice } from "@/components/SupabaseNotice";
import { isSupabaseConfigured, listApplications } from "@/lib/adminDb";
import type { ApplicationStatus } from "@/types/admin";

const STATUS_TABS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function shortHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const configured = isSupabaseConfigured();
  const activeStatus =
    STATUS_TABS.find((t) => t.value === searchParams.status)?.value ?? "all";

  const applications = configured
    ? await listApplications({
        status: activeStatus === "all" ? undefined : (activeStatus as ApplicationStatus),
      })
    : [];

  const exportHref =
    activeStatus === "all"
      ? "/api/applications/export"
      : `/api/applications/export?status=${activeStatus}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600 mt-1">
            Citizen applications submitted through the WhatsApp bot (stored in Supabase).
          </p>
        </div>
        {configured ? (
          <a href={exportHref} className="btn-secondary text-sm">
            ⬇ Export CSV
          </a>
        ) : null}
      </div>

      {!configured ? (
        <SupabaseNotice />
      ) : (
        <>
          <div className="card p-2 flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={
                  tab.value === "all"
                    ? "/applications"
                    : `/applications?status=${tab.value}`
                }
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
            {applications.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No applications yet. They appear here when users complete application
                flows in WhatsApp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Benefit</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Completed</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4 align-top font-mono text-xs text-brand-700">
                          {app.reference_code}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-slate-900">
                            {app.benefit_name}
                          </div>
                          <div className="text-xs text-slate-500">{app.benefit_id}</div>
                        </td>
                        <td className="px-4 py-4 align-top font-mono text-xs text-slate-500">
                          {shortHash(app.user_id_hash)}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-500 whitespace-nowrap">
                          {new Date(app.completed_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <ApplicationStatusSelect id={app.id} status={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
