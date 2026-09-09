import { NextRequest, NextResponse } from "next/server";
import { importBenefitFromDocument, MAX_DOC_BYTES } from "@/lib/docImport";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_DOC_BYTES) {
      return NextResponse.json({ error: "File is too large (max 10 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[api/benefits/import-doc] parsing:", file.name, file.size, "bytes");

    const result = await importBenefitFromDocument(buffer, file.name);
    console.log(
      "[api/benefits/import-doc] extracted",
      result.extractedChars,
      "chars from",
      file.name
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Document import failed";
    console.error("[api/benefits/import-doc] error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
