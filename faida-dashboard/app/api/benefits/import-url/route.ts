import { NextRequest, NextResponse } from "next/server";
import { importBenefitFromUrl } from "@/lib/pageImport";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    console.log("[api/benefits/import-url] fetching:", body.url);
    const result = await importBenefitFromUrl(body.url);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("[api/benefits/import-url] error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
