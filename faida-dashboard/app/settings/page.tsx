import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/adminDb";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  const connection = configured ? await testSupabaseConnection() : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Environment and database connection for the admin dashboard.
        </p>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Supabase connection</h2>
        <p className="text-sm text-slate-600">
          The dashboard uses the same Supabase project as the WhatsApp bot. Required
          variables: <code className="text-xs bg-slate-100 px-1 rounded">SUPABASE_URL</code>,{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-slate-500 text-xs uppercase tracking-wide">Status</div>
            <div className="mt-1 font-semibold flex items-center gap-2">
              {connection?.ok ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">Connected</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-red-700">Not connected</span>
                </>
              )}
            </div>
          </div>
          {connection?.ok ? (
            <>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-slate-500 text-xs uppercase tracking-wide">Users</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {connection.users ?? 0}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-slate-500 text-xs uppercase tracking-wide">Applications</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {connection.applications ?? 0}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-slate-500 text-xs uppercase tracking-wide">Benefits catalog</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {connection.benefits ?? 0}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {!configured ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
            Env vars not loaded. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to
            .env.local (local) or Vercel → Settings → Environment Variables, then
            redeploy.
          </div>
        ) : !connection?.ok ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-900">
            Credentials found but connection failed: {connection?.message}
            <div className="mt-2 text-xs">
              Run faida-export/supabase/schema.sql in your Supabase SQL editor if tables
              are missing.
            </div>
          </div>
        ) : (
          <p className="text-sm text-emerald-700">
            {connection.message} ({connection.users ?? 0} users,{" "}
            {connection.applications ?? 0} applications, {connection.benefits ?? 0}{" "}
            benefits in database)
          </p>
        )}
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
        <p className="text-sm text-slate-600">
          <code className="text-xs bg-slate-100 px-1 rounded">FAIDA_HASH_SALT</code> must match
          the bot&apos;s <code className="text-xs bg-slate-100 px-1 rounded">.env</code> so user
          hashes align. Phone numbers are never stored — only SHA-256 hashes.
        </p>
      </section>
    </div>
  );
}
