import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { getBenefitById } from "@/lib/benefitsIo";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export default function DeleteBenefitPage({ params }: Params) {
  const benefit = getBenefitById(params.id);
  if (!benefit) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href={`/benefits/${benefit.id}`}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to edit
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Delete Benefit
        </h1>
      </div>
      <DeleteConfirm benefit={benefit} />
    </div>
  );
}
