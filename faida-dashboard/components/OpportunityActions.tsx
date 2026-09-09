"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  status: string;
  link?: string;
};

export function OpportunityActions({ id, status, link }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: "approved" | "rejected") {
    setLoading(next === "approved" ? "approve" : "reject");
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      let data: { error?: string; ok?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}). Check Vercel env: SUPABASE_SERVICE_ROLE_KEY`);
      }
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  if (status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        ✓ Live on bot
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        Rejected
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {link ? (
        <a
          href={`/benefits/new?url=${encodeURIComponent(link)}`}
          className="text-xs text-brand-600 hover:underline mb-1"
        >
          Add to catalog →
        </a>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => updateStatus("approved")}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {loading === "approve" ? "…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => updateStatus("rejected")}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {loading === "reject" ? "…" : "Reject"}
        </button>
      </div>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
