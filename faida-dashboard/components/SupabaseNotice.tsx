import Link from "next/link";

export function SupabaseNotice() {
  return (
    <div className="card p-6 border-amber-200 bg-amber-50">
      <h2 className="font-semibold text-amber-900">Supabase not connected</h2>
      <p className="text-sm text-amber-800 mt-2">
        Add{" "}
        <code className="text-xs bg-white px-1 rounded">SUPABASE_URL</code> and{" "}
        <code className="text-xs bg-white px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        to <code className="text-xs bg-white px-1 rounded">.env.local</code> (local) or Vercel
        environment variables (production). Use the same project as the WhatsApp bot.
      </p>
      <Link href="/settings" className="text-sm text-brand-700 hover:underline mt-3 inline-block">
        Test connection in Settings →
      </Link>
    </div>
  );
}
