"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import type { Benefit } from "@/types/benefit";

interface Props {
  benefit: Benefit;
}

export const DeleteConfirm: FC<Props> = ({ benefit }) => {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === benefit.id;

  async function handleDelete() {
    if (!canDelete) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/benefits/${encodeURIComponent(benefit.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      router.push(
        `/benefits?toast=${encodeURIComponent(
          `Deleted "${benefit.name}"`
        )}`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 max-w-xl mx-auto border-red-200 bg-red-50/30">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-2xl shrink-0">
          ⚠️
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-red-900">
            Delete this benefit?
          </h2>
          <p className="text-red-700 mt-1 text-sm">
            This action is permanent. The benefit will immediately disappear
            from WhatsApp results for all users.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-red-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{benefit.emoji}</span>
          <div>
            <div className="font-semibold text-slate-900">{benefit.name}</div>
            <div className="text-xs text-slate-500 font-mono">
              {benefit.id} · {benefit.provider}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="label">
          Type the benefit ID <code>{benefit.id}</code> to confirm:
        </label>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={benefit.id}
          className="input font-mono"
        />
        {error && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <Link
          href={`/benefits/${benefit.id}`}
          className="btn-secondary"
        >
          Cancel
        </Link>
        <button
          onClick={handleDelete}
          disabled={!canDelete || loading}
          className="btn-danger"
        >
          {loading ? "Deleting..." : "Delete Permanently"}
        </button>
      </div>
    </div>
  );
};
