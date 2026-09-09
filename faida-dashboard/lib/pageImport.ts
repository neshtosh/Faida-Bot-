import crypto from "crypto";
import type { Benefit } from "@/types/benefit";

const FETCH_TIMEOUT_MS = 30000;
const MAX_BYTES = 1_500_000;

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return stripHtml(m[1]);
  }
  return "";
}

function firstMatch(html: string, selectors: RegExp[]): string {
  for (const re of selectors) {
    const m = html.match(re);
    if (m?.[1]) return stripHtml(m[1]).slice(0, 2000);
  }
  return "";
}

function slugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "");
    const segment = path.split("/").filter(Boolean).pop() || "benefit";
    const slug = segment
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 6);
    return slug ? `${slug}-${hash}` : `benefit-${hash}`;
  } catch {
    return `benefit-${crypto.randomBytes(4).toString("hex")}`;
  }
}

function guessCategory(text: string): Benefit["category"] {
  const lower = text.toLowerCase();
  if (/loan|grant|fund|finance|tender|bursary|scholarship/.test(lower)) return "financial";
  if (/job|employment|training|skills|volunteer|ajira/.test(lower)) return "employment";
  if (/health|medical|hospital|sha|nhif/.test(lower)) return "health";
  if (/legal|court|lawyer/.test(lower)) return "legal";
  if (/housing|nyumba|boma/.test(lower)) return "housing";
  return "financial";
}

function guessProvider(url: string, title: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("m-taji")) return "M-Taji";
    if (host.endsWith(".go.ke")) return "Government of Kenya";
    if (host.includes("worldbank")) return "World Bank";
    if (host.includes("usaid")) return "USAID";
    return host;
  } catch {
    return title.split("|")[0]?.trim() || "Official source";
  }
}

function extractApplySteps(html: string, link: string): string {
  const listItems = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter((t) => t.length > 15 && t.length < 300)
    .slice(0, 6);

  if (listItems.length >= 2) {
    return listItems.map((step, i) => `${i + 1}. ${step}`).join("\n");
  }

  return `1. Read the full details on the official page.\n2. Check eligibility requirements.\n3. Apply online: ${link}`;
}

function extractDocuments(text: string): string {
  const docHints = text.match(
    /(?:required documents?|documents required|you will need)[:\s-]*([^.]{10,200})/i
  );
  return docHints?.[1]?.trim() || "National ID and any documents listed on the official page";
}

function extractAmount(text: string): string {
  const amount = text.match(
    /(?:up to|worth|amount|fund(?:ing)?|grant)[:\s]*((?:ksh|kes|usd|\$|€)?[\s\d,.]+(?:\s*(?:million|billion|k|m))?[^.]{0,40})/i
  );
  return amount?.[1]?.trim() || "See official page for amount";
}

function titleFromUrlPath(url: string): string {
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    const slug = segments[segments.length - 1] || "imported-benefit";
    return slug
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 120);
  } catch {
    return "Imported benefit";
  }
}

function buildFallbackFromUrl(url: string, reason: string): Partial<Benefit> {
  const name = titleFromUrlPath(url);
  const provider = guessProvider(url, name);
  return {
    id: slugFromUrl(url),
    name,
    provider,
    category: guessCategory(name),
    emoji: "📋",
    description: `${name} — imported from ${provider}. Could not auto-read page content (${reason}). Please review and complete the fields below.`,
    amount: "See official page",
    howToApply: `1. Open the official link below.\n2. Read eligibility and application steps.\n3. Apply on: ${url}`,
    documents: "See official page",
    deadline: "Check official page",
    link: url,
    eligibility: {
      minAge: 18,
      maxAge: 99,
      gender: "any",
      employed: "any",
      businessOwner: "any",
      disability: "any",
      counties: ["any"],
      sectors: ["any"],
      groupRequired: false,
    },
  };
}

function describeFetchError(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause as { code?: string; message?: string } | undefined;
    if (cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
      return "connection timed out — site may be slow or unreachable from this server";
    }
    if (cause?.code === "UND_ERR_HEADERS_TIMEOUT") {
      return "site took too long to respond";
    }
    if (cause?.message) return cause.message;
    if (err.name === "AbortError") return "request timed out after 30 seconds";
    return err.message;
  }
  return "network error";
}

function parseHttpUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Enter a valid URL starting with http:// or https://");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http:// and https:// links are supported");
  }
  return parsed.toString();
}

/**
 * Fetches a page and maps it to a partial Benefit for the admin form.
 * Admin is responsible for vetting the source before publishing.
 */
export type ImportResult = {
  benefit: Partial<Benefit>;
  partial: boolean;
  warning?: string;
};

export async function importBenefitFromUrl(url: string): Promise<ImportResult> {
  const normalized = parseHttpUrl(url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      const reason = `HTTP ${res.status}`;
      return {
        benefit: buildFallbackFromUrl(normalized, reason),
        partial: true,
        warning: `Page returned ${res.status}. Basic fields filled from the URL — complete the rest manually.`,
      };
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) throw new Error("Page is too large to import");
    html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  } catch (err) {
    clearTimeout(timer);
    const reason = describeFetchError(err);
    console.warn("[pageImport] fetch failed:", reason, normalized);
    return {
      benefit: buildFallbackFromUrl(normalized, reason),
      partial: true,
      warning: `Could not read page (${reason}). Basic fields filled from the URL — open the link and complete the form manually.`,
    };
  } finally {
    clearTimeout(timer);
  }

  const ogTitle = metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description");
  const metaDesc = metaContent(html, "description");
  const titleTag = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const h1 = firstMatch(html, [/<h1[^>]*>([\s\S]*?)<\/h1>/i]);

  const name = (ogTitle || h1 || titleTag.split("|")[0] || "Imported benefit").slice(0, 120);
  const description = (ogDesc || metaDesc || firstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
    /<article[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
  ])).slice(0, 600);

  const bodyText = stripHtml(html).slice(0, 8000);
  const category = guessCategory(`${name} ${description} ${bodyText}`);
  const provider = guessProvider(normalized, name);

  return {
    benefit: {
      id: slugFromUrl(normalized),
      name,
      provider,
      category,
      emoji: category === "employment" ? "💼" : category === "health" ? "🏥" : "💰",
      description: description || name,
      amount: extractAmount(bodyText),
      howToApply: extractApplySteps(html, normalized),
      documents: extractDocuments(bodyText),
      deadline: /deadline|apply by|closing date/i.test(bodyText)
        ? "Check official page for deadline"
        : "Rolling",
      link: normalized,
      eligibility: {
        minAge: 18,
        maxAge: 99,
        gender: "any",
        employed: "any",
        businessOwner: "any",
        disability: "any",
        counties: ["any"],
        sectors: ["any"],
        groupRequired: false,
      },
    },
    partial: false,
  };
}
