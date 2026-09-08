"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Overview",
    icon: "📊",
    match: (path: string) => path === "/",
  },
  {
    href: "/benefits",
    label: "Benefits",
    icon: "📋",
    match: (path: string) =>
      path === "/benefits" || path.startsWith("/benefits/"),
  },
  {
    href: "/applications",
    label: "Applications",
    icon: "📝",
    match: (path: string) => path === "/applications",
  },
  {
    href: "/users",
    label: "Users",
    icon: "👥",
    match: (path: string) => path === "/users",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙️",
    match: (path: string) => path === "/settings",
  },
];

export const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col bg-white border-r border-slate-200">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200">
        <span className="text-2xl">🌿</span>
        <div>
          <div className="font-bold text-brand-700 leading-tight">Faida</div>
          <div className="text-[11px] text-slate-500 leading-tight">
            Admin Console
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">WhatsApp Bot</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-700">
            Connected
          </span>
        </div>
      </div>
    </aside>
  );
};
