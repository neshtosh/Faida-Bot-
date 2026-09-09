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
    console.log("[api/opportunities] GET", status || "all", "→", rows.length, "rows");
    return NextResponse.json({ opportunities: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load opportunities";
    console.error("[api/opportunities] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log("[api/opportunities] POST scrape started");
    const result = await queueScrapedOpportunities();
    console.log("[api/opportunities] POST scrape done:", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    console.error("[api/opportunities] POST error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
