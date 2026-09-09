import { benefitFromText } from "./benefitFromText";
import type { Benefit } from "@/types/benefit";

export const MAX_DOC_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "docx",
  "txt",
  "md",
  "rtf",
]);

export type DocImportResult = {
  benefit: Partial<Benefit>;
  partial: boolean;
  warning?: string;
  extractedChars: number;
  fileName: string;
};

function extensionOf(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

function extractPlainText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\'[0-9a-f]{2}/gi, " ")
    .replace(/\\[a-z]+\d* ?/gi, " ")
    .replace(/[{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts text from an uploaded admin document.
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = extensionOf(fileName);

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported file type (.${ext}). Upload PDF, DOCX, TXT, MD, or RTF.`
    );
  }

  if (buffer.byteLength > MAX_DOC_BYTES) {
    throw new Error("File is too large (max 10 MB).");
  }

  switch (ext) {
    case "pdf":
      return extractPdfText(buffer);
    case "docx":
      return extractDocxText(buffer);
    case "txt":
    case "md":
      return extractPlainText(buffer);
    case "rtf":
      return stripRtf(extractPlainText(buffer));
    default:
      throw new Error(`Unsupported file type (.${ext})`);
  }
}

/**
 * Reads a document and maps contents to benefit form fields.
 */
export async function importBenefitFromDocument(
  buffer: Buffer,
  fileName: string
): Promise<DocImportResult> {
  const text = await extractTextFromDocument(buffer, fileName);
  const trimmed = text.replace(/\s+/g, " ").trim();

  if (trimmed.length < 20) {
    return {
      benefit: benefitFromText(trimmed || fileName, { fileName }),
      partial: true,
      warning:
        "Very little text could be extracted (scanned PDF or empty file). Basic fields filled from the filename — complete manually.",
      extractedChars: trimmed.length,
      fileName,
    };
  }

  return {
    benefit: benefitFromText(text, { fileName }),
    partial: trimmed.length < 120,
    warning:
      trimmed.length < 120
        ? "Limited text extracted. Review all fields before saving."
        : undefined,
    extractedChars: trimmed.length,
    fileName,
  };
}
