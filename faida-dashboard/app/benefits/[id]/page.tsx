import Link from "next/link";
import { notFound } from "next/navigation";
import { BenefitForm } from "@/components/BenefitForm";
import { getBenefitById } from "@/lib/benefitsIo";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export default function EditBenefitPage({ params }: Params) {
  const benefit = getBenefitById(params.id);
  if (!benefit) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/benefits"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Benefits
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          <span className="mr-2">{benefit.emoji}</span>
          Edit {benefit.name}
        </h1>
        <p className="text-slate-600 mt-1 font-mono text-sm">ID: {benefit.id}</p>
      </div>

      <BenefitForm mode="edit" initial={benefit} />
    </div>
  );
}
