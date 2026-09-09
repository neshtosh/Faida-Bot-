import { NextRequest, NextResponse } from "next/server";
import { setOpportunityStatus } from "@/lib/opportunitiesDb";
import { getRouteParam } from "@/lib/routeParams";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const id = await getRouteParam(context.params, "id");
    const body = (await req.json()) as { status?: "approved" | "rejected" };

    if (body.status !== "approved" && body.status !== "rejected") {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    console.log("[api/opportunities/[id]] PATCH", id, "→", body.status);
    await setOpportunityStatus(id, body.status);
    return NextResponse.json({ ok: true, id, status: body.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    console.error("[api/opportunities/[id]] PATCH error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
