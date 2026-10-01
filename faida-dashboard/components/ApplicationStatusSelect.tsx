"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApplicationStatus } from "@/types/admin";

const STATUSES: ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "withdrawn",
];

type Props = {
  id: string;
  status: ApplicationStatus;
};

export function ApplicationStatusSelect({ id, status }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: ApplicationStatus) {
    setLoading(true);
    setError(null);
    setValue(next);

    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (err) {
      setValue(status);
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        className="input text-xs py-1.5 min-w-[130px]"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
