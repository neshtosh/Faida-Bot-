import Link from "next/link";

export default function PlaceholderPage({
  title,
  icon,
  description,
  roadmapNote,
}: {
  title: string;
  icon: string;
  description: string;
  roadmapNote: string;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-8 text-center">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-4xl">
          {icon}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600 max-w-lg mx-auto">{description}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          🚧 {roadmapNote}
        </div>
        <div className="mt-8">
          <Link href="/" className="btn-primary">
            ← Back to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
