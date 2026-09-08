import { NextResponse } from "next/server";
import type { Benefit } from "@/types/benefit";
import {
  deleteBenefitById,
  getBenefitById,
  readBenefits,
  writeBenefits,
} from "@/lib/benefitsIo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const benefit = getBenefitById(params.id);
    if (!benefit) {
      return NextResponse.json(
        { error: `Benefit '${params.id}' not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ benefit });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = (await req.json()) as Partial<Benefit>;
    const all = readBenefits();
    const idx = all.findIndex((b) => b.id === params.id);
    if (idx < 0) {
      return NextResponse.json(
        { error: `Benefit '${params.id}' not found` },
        { status: 404 }
      );
    }

    const existing = all[idx];
    const updatedEligibility = {
      ...existing.eligibility,
      ...(payload.eligibility ?? {}),
    };

    const updated: Benefit = {
      ...existing,
      ...payload,
      id: params.id,
      eligibility: updatedEligibility,
    };

    all[idx] = updated;
    writeBenefits(all);

    return NextResponse.json({ ok: true, benefit: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const removed = deleteBenefitById(params.id);
    if (!removed) {
      return NextResponse.json(
        { error: `Benefit '${params.id}' not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, deletedId: params.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
