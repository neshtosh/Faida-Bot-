import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/adminDb";
import { getRouteParam } from "@/lib/routeParams";
import type { ApplicationStatus } from "@/types/admin";

const VALID: ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "withdrawn",
];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const id = await getRouteParam(context.params, "id");
    const body = (await req.json()) as { status?: ApplicationStatus };
    if (!body.status || !VALID.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await updateApplicationStatus(id, body.status);
    return NextResponse.json({ ok: true, id, status: body.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
