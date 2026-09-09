import { NextRequest, NextResponse } from "next/server";
import { setOpportunityStatus } from "@/lib/opportunitiesDb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as { status?: "approved" | "rejected" };
    if (body.status !== "approved" && body.status !== "rejected") {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    await setOpportunityStatus(params.id, body.status);
    return NextResponse.json({ ok: true, id: params.id, status: body.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
