import { NextRequest, NextResponse } from "next/server";
import { applicationsToCsv, listApplications } from "@/lib/adminDb";
import type { ApplicationStatus } from "@/types/admin";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") as ApplicationStatus | null;
    const rows = await listApplications({
      status: status || undefined,
      limit: 5000,
    });
    const csv = applicationsToCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="faida-applications-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
