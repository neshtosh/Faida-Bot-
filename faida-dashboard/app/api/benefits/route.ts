import { NextResponse } from "next/server";
import type { Benefit } from "@/types/benefit";
import { readBenefits, slugifyId, writeBenefits } from "@/lib/benefitsIo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const benefits = readBenefits();
    return NextResponse.json({ count: benefits.length, results: benefits });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Partial<Benefit>;

    if (!payload.name || !payload.category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 }
      );
    }

    const all = readBenefits();
    const id =
      payload.id && payload.id.trim().length > 0
        ? payload.id.trim()
        : slugifyId(payload.name);

    if (all.some((b) => b.id === id)) {
      return NextResponse.json(
        {
          error: `A benefit with id '${id}' already exists. Use PUT /api/benefits/${id} to update it.`,
        },
        { status: 409 }
      );
    }

    const newBenefit: Benefit = {
      id,
      name: payload.name,
      provider: payload.provider ?? "",
      category: payload.category,
      emoji: payload.emoji ?? "📋",
      description: payload.description ?? "",
      amount: payload.amount ?? "",
      howToApply: payload.howToApply ?? "",
      documents: payload.documents ?? "",
      deadline: payload.deadline ?? "Rolling",
      deadlineDate: payload.deadlineDate,
      deadlineAnnual: payload.deadlineAnnual,
      link: payload.link ?? "",
      eligibility: {
        minAge: payload.eligibility?.minAge ?? 18,
        maxAge: payload.eligibility?.maxAge ?? 99,
        gender: payload.eligibility?.gender ?? "any",
        employed:
          payload.eligibility?.employed === undefined
            ? "any"
            : payload.eligibility.employed,
        businessOwner:
          payload.eligibility?.businessOwner === undefined
            ? "any"
            : payload.eligibility.businessOwner,
        disability:
          payload.eligibility?.disability === undefined
            ? "any"
            : payload.eligibility.disability,
        counties: payload.eligibility?.counties ?? ["any"],
        sectors: payload.eligibility?.sectors ?? ["any"],
        groupRequired: payload.eligibility?.groupRequired ?? false,
        safaricomRequired: payload.eligibility?.safaricomRequired,
        businessAgeMin: payload.eligibility?.businessAgeMin,
      },
    };

    all.push(newBenefit);
    writeBenefits(all);

    return NextResponse.json({ ok: true, benefit: newBenefit }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
