import { NextResponse } from "next/server";
import type { Benefit } from "@/types/benefit";
import {
  deleteBenefitById,
  getBenefitById,
  upsertBenefit,
} from "@/lib/benefitsIo";
import { getRouteParam } from "@/lib/routeParams";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const id = await getRouteParam(context.params, "id");
    const benefit = await getBenefitById(id);
    if (!benefit) {
      return NextResponse.json({ error: `Benefit '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json({ benefit });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const id = await getRouteParam(context.params, "id");
    const payload = (await req.json()) as Partial<Benefit>;
    const existing = await getBenefitById(id);
    if (!existing) {
      return NextResponse.json({ error: `Benefit '${id}' not found` }, { status: 404 });
    }

    const updated: Benefit = {
      ...existing,
      ...payload,
      id,
      eligibility: {
        ...existing.eligibility,
        ...(payload.eligibility ?? {}),
      },
    };

    await upsertBenefit(updated);

    return NextResponse.json({ ok: true, benefit: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const id = await getRouteParam(context.params, "id");
    const removed = await deleteBenefitById(id);
    if (!removed) {
      return NextResponse.json({ error: `Benefit '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
