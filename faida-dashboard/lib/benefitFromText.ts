import crypto from "crypto";
import type { Benefit } from "@/types/benefit";

const DEFAULT_ELIGIBILITY: Benefit["eligibility"] = {
  minAge: 18,
  maxAge: 99,
  gender: "any",
  employed: "any",
  businessOwner: "any",
  disability: "any",
  counties: ["any"],
  sectors: ["any"],
  groupRequired: false,
};

function guessCategory(text: string): Benefit["category"] {
  const lower = text.toLowerCase();
  if (/loan|grant|fund|finance|tender|bursary|scholarship/.test(lower)) return "financial";
  if (/job|employment|training|skills|volunteer|ajira/.test(lower)) return "employment";
  if (/health|medical|hospital|sha|nhif/.test(lower)) return "health";
  if (/legal|court|lawyer/.test(lower)) return "legal";
  if (/housing|nyumba|boma/.test(lower)) return "housing";
  return "financial";
}

function slugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const hash = crypto.createHash("sha256").update(name).digest("hex").slice(0, 6);
  return slug ? `${slug}-${hash}` : `benefit-${hash}`;
}

function extractName(text: string, fileName?: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const titled = lines.find((l) =>
    /^(?:call for|applications? for|programme|program|grant|fund|scheme|fellowship|bursary)/i.test(l)
  );
  if (titled) return titled.slice(0, 120);

  const short = lines.find((l) => l.length >= 8 && l.length <= 120);
  if (short) return short;

  if (fileName) {
    return fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 120);
  }

  return "Imported benefit";
}

function extractDescription(text: string, name: string): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40 && p !== name);

  if (paragraphs[0]) return paragraphs[0].slice(0, 600);

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const body = lines.slice(1, 4).join(" ").slice(0, 600);
  return body || name;
}

function extractProvider(text: string): string {
  const match = text.match(
    /(?:issued by|provided by|sponsored by|organization|organiser|organizer|facilitated by)[:\s-]+([^\n.]{3,80})/i
  );
  if (match?.[1]) return match[1].trim();

  if (/government of kenya|gok\b/i.test(text)) return "Government of Kenya";
  if (/world bank/i.test(text)) return "World Bank";
  if (/usaid/i.test(text)) return "USAID";

  return "";
}

function extractAmount(text: string): string {
  const patterns = [
    /(?:up to|worth|amount|fund(?:ing)?|grant|prize|award)[:\s]*((?:ksh|kes|usd|\$|€|£)?[\s\d,.]+(?:\s*(?:million|billion|thousand|k|m))?[^.\n]{0,40})/i,
    /((?:ksh|kes)\s*[\d,.]+(?:\s*(?:million|billion))?)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return "See document for amount";
}

function extractDeadline(text: string): string {
  const patterns = [
    /(?:deadline|closing date|apply by|due date|submission date)[:\s-]+([^\n.]{4,80})/i,
    /(?:before|by)\s+(\d{1,2}\s+\w+\s+\d{4})/i,
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return /deadline|apply by|closing date/i.test(text)
    ? "Check document for deadline"
    : "Rolling";
}

function extractSection(text: string, headers: string[]): string {
  const lower = text.toLowerCase();
  for (const header of headers) {
    const idx = lower.indexOf(header.toLowerCase());
    if (idx === -1) continue;
    const slice = text.slice(idx + header.length).trim();
    const end = slice.search(/\n\s*\n|\n(?:eligibility|requirements|contact|about)\b/i);
    const block = (end > 0 ? slice.slice(0, end) : slice.slice(0, 800)).trim();
    if (block.length > 10) return block.slice(0, 1000);
  }
  return "";
}

function extractHowToApply(text: string, link?: string): string {
  const section = extractSection(text, [
    "how to apply",
    "application process",
    "application procedure",
    "to apply",
  ]);

  const numbered = [...text.matchAll(/(?:^|\n)\s*(\d{1,2})[.)]\s+([^\n]{10,200})/g)]
    .slice(0, 8)
    .map((m) => `${m[1]}. ${m[2].trim()}`);

  if (numbered.length >= 2) return numbered.join("\n");
  if (section) {
    const bullets = section
      .split(/\n/)
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter((l) => l.length > 10)
      .slice(0, 6);
    if (bullets.length >= 2) {
      return bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    }
    return section.slice(0, 800);
  }

  return link
    ? `1. Read the full document.\n2. Check eligibility requirements.\n3. Apply via: ${link}`
    : "1. Read the uploaded document.\n2. Check eligibility requirements.\n3. Follow the application steps listed.";
}

function extractDocuments(text: string): string {
  const section = extractSection(text, [
    "required documents",
    "documents required",
    "documentation required",
    "what you need",
    "supporting documents",
  ]);
  if (section) return section.slice(0, 500);

  const inline = text.match(
    /(?:required documents?|documents required|you will need)[:\s-]*([^\n.]{10,200})/i
  );
  return inline?.[1]?.trim() || "National ID and documents listed in the source material";
}

function extractAgeRange(text: string): { minAge: number; maxAge: number } {
  const range = text.match(/(?:aged?|ages?|between)\s*(\d{1,2})\s*(?:and|to|-)\s*(\d{1,2})/i);
  if (range) {
    return { minAge: Number(range[1]), maxAge: Number(range[2]) };
  }
  const minOnly = text.match(/(?:minimum age|aged? at least|must be at least)\s*(\d{1,2})/i);
  if (minOnly) {
    return { minAge: Number(minOnly[1]), maxAge: 99 };
  }
  return { minAge: 18, maxAge: 99 };
}

function extractCounties(text: string): string[] {
  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado",
    "Uasin Gishu", "Kakamega", "Meru", "Nyeri", "Turkana", "Garissa", "Mandera",
  ];
  const found = counties.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
  return found.length > 0 ? found : ["any"];
}

/**
 * Maps plain text (from PDF, DOCX, etc.) to benefit form fields.
 */
export function benefitFromText(
  text: string,
  options: { fileName?: string; sourceUrl?: string } = {}
): Partial<Benefit> {
  const cleaned = text.replace(/\0/g, " ").replace(/\s+/g, " ").trim();
  const name = extractName(cleaned, options.fileName);
  const description = extractDescription(cleaned, name);
  const category = guessCategory(cleaned);
  const provider = extractProvider(cleaned) || "See source document";
  const ages = extractAgeRange(cleaned);

  return {
    id: slugFromName(name),
    name,
    provider,
    category,
    emoji: category === "employment" ? "💼" : category === "health" ? "🏥" : "💰",
    description,
    amount: extractAmount(cleaned),
    howToApply: extractHowToApply(cleaned, options.sourceUrl),
    documents: extractDocuments(cleaned),
    deadline: extractDeadline(cleaned),
    link: options.sourceUrl || "",
    eligibility: {
      ...DEFAULT_ELIGIBILITY,
      minAge: ages.minAge,
      maxAge: ages.maxAge,
      counties: extractCounties(cleaned),
    },
  };
}
