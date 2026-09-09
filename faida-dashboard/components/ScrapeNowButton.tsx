"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScrapeNowButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runScrape() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/opportunities", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scrape failed");
      const dbg = data.debug
        ? ` (M-Taji: ${data.debug.mtaji}, World Bank: ${data.debug.worldBank}, RSS: ${data.debug.rss})`
        : "";
      const errHint =
        data.scraped === 0 && data.debug?.errors?.length
          ? ` Errors: ${data.debug.errors.join("; ")}`
          : "";
      setMessage(
        `Found ${data.scraped} — ${data.inserted} new, ${data.updated} updated, ${data.skipped} skipped${dbg}${errHint}`
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={runScrape}
        disabled={loading}
        className="btn-secondary text-sm"
      >
        {loading ? "Scraping…" : "🔄 Scrape now"}
      </button>
      {message ? (
        <span className="text-xs text-slate-600 max-w-xs text-right">{message}</span>
      ) : null}
    </div>
  );
}
