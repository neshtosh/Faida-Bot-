import Link from "next/link";
import { BenefitForm } from "@/components/BenefitForm";

export default function NewBenefitPage() {
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
          New Benefit
        </h1>
        <p className="text-slate-600 mt-1">
          Add a new government, NGO, or private-sector benefit to the catalog.
          Users on WhatsApp will see it immediately after save.
        </p>
      </div>

      <BenefitForm mode="create" />
    </div>
  );
}
