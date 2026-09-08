import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "Faida Admin Dashboard",
  description:
    "Admin dashboard for managing benefits, applications, and analytics for the Faida WhatsApp bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex bg-slate-50">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-soft">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="text-2xl">🌿</span>
                <span className="font-semibold">Faida Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/benefits/new"
                  className="btn-primary text-sm"
                >
                  <span>＋</span> New Benefit
                </Link>
                <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                  A
                </div>
              </div>
            </header>
            <div className="p-6 md:p-8">{children}</div>
          </main>
        </div>
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
