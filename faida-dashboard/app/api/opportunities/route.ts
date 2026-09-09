import { NextRequest, NextResponse } from "next/server";
import {
  listOpportunities,
  queueScrapedOpportunities,
  type OpportunityStatus,
} from "@/lib/opportunitiesDb";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as OpportunityStatus | null;

  try {
    const rows = await listOpportunities(status || undefined);
    return NextResponse.json({ opportunities: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load opportunities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await queueScrapedOpportunities();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
