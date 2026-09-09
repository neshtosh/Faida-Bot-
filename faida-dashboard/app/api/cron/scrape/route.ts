import { NextRequest, NextResponse } from "next/server";
import { queueScrapedOpportunities } from "@/lib/opportunitiesDb";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  // Vercel Cron sends this header on scheduled invocations
  if (req.headers.get("x-vercel-cron") === "1") return true;

  return false;
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
