import { isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  invalid: "Incorrect password.",
  config: "ADMIN_PASSWORD is not set on the server (8+ characters).",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const error = !isAuthConfigured() ? ERRORS.config : ERRORS[searchParams.error || ""];

  return (
    // Covers the app chrome from the root layout
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 p-4">
      <form method="POST" action="/api/auth/login" className="card w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <h1 className="text-lg font-semibold text-slate-800">Faida Admin</h1>
        </div>
        <input type="hidden" name="next" value={searchParams.next || "/admin"} />
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full justify-center">
          Sign in
        </button>
      </form>
    </div>
  );
}
