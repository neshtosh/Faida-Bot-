import { NextRequest, NextResponse } from "next/server";
import { queueScrapedOpportunities } from "@/lib/opportunitiesDb";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel Cron also sends "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
  // Don't trust x-vercel-cron — any client can send that header.
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await queueScrapedOpportunities();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
