"use client";

import Link from "next/link";
import { useEffect, useState, type FC } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const Toaster: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const toast = search.get("toast");
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      setVisible(toast);
      const params = new URLSearchParams(search.toString());
      params.delete("toast");
      const qs = params.toString();
      const next = `${pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", next);
      const t = setTimeout(() => setVisible(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast, search, pathname]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 rounded-lg bg-slate-900 text-white px-4 py-3 shadow-2xl text-sm max-w-sm">
        <span className="text-emerald-400">✓</span>
        <span className="flex-1">{visible}</span>
        <button
          onClick={() => setVisible(null)}
          className="text-slate-400 hover:text-white ml-2"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
