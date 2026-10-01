import { SupabaseNotice } from "@/components/SupabaseNotice";
import { isSupabaseConfigured, listUsers } from "@/lib/adminDb";

export const dynamic = "force-dynamic";

function shortHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export default async function UsersPage() {
  const configured = isSupabaseConfigured();
  const users = configured ? await listUsers() : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600 mt-1">
          Anonymised WhatsApp users (hashed IDs only — no phone numbers stored).
        </p>
      </div>

      {!configured ? (
        <SupabaseNotice />
      ) : (
        <div className="card overflow-hidden">
          {users.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No users yet. Rows appear when someone messages the WhatsApp bot.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">User ID (hash)</th>
                    <th className="px-4 py-3 font-medium">Profile</th>
                    <th className="px-4 py-3 font-medium">Language</th>
                    <th className="px-4 py-3 font-medium">Apps</th>
                    <th className="px-4 py-3 font-medium">Matches</th>
                    <th className="px-4 py-3 font-medium">Reminders</th>
                    <th className="px-4 py-3 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const p = user.profile_snapshot || {};
                    return (
                      <tr key={user.user_id_hash} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4 align-top font-mono text-xs text-slate-600">
                          {shortHash(user.user_id_hash)}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          {[p.age ? `${p.age}y` : null, p.gender, p.county, p.sector]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-4 align-top uppercase text-xs text-slate-500">
                          {user.language || "—"}
                        </td>
                        <td className="px-4 py-4 align-top">{user.app_count}</td>
                        <td className="px-4 py-4 align-top">{user.match_count}</td>
                        <td className="px-4 py-4 align-top">
                          {user.reminder_opt_in ? (
                            <span className="text-emerald-700 text-xs font-medium">On</span>
                          ) : (
                            <span className="text-slate-400 text-xs">Off</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-500 whitespace-nowrap">
                          {new Date(user.last_seen_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
