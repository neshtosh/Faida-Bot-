import crypto from "crypto";

const VERIFIED_DOMAINS = [
  "go.ke",
  "or.ke",
  "ac.ke",
  "co.ke",
  "worldbank.org",
  "usaid.gov",
  "mastercardfdn.org",
  "tonyelumelufoundation.org",
  "safaricom.co.ke",
  "equitybank.co.ke",
  "kcbgroup.com",
  "google.com",
  "developpp.vc",
  "undp.org",
  "un.org",
  "widu.africa",
  "startup.google.com",
  "m-taji.co.ke",
];

const VERIFIED_FEEDS = [
  {
    id: "worldbank-news",
    name: "World Bank — News",
    url: "https://www.worldbank.org/en/news/rss",
    keywords: ["kenya", "africa", "grant", "fund", "youth", "sme"],
  },
  {
    id: "usaid-press",
    name: "USAID — Press Releases",
    url: "https://www.usaid.gov/rss/press-releases.xml",
    keywords: ["kenya", "grant", "youth", "agriculture"],
  },
];

const FETCH_TIMEOUT_MS = 15000;

const DEFAULT_ELIGIBILITY = {
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

export type ScrapedOpportunity = {
  id: string;
  source: "rss" | "mtaji";
  source_name: string;
  link: string;
  name: string;
  provider: string;
  category: string;
  emoji: string;
  description: string;
  amount: string;
  how_to_apply: string;
  documents: string;
  deadline: string;
  eligibility: typeof DEFAULT_ELIGIBILITY;
  raw_payload?: Record<string, unknown>;
};

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function isVerifiedUrl(urlString: string): boolean {
  if (!urlString) return false;
  try {
    const host = new URL(urlString).hostname.toLowerCase();
    return VERIFIED_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function parseRssItems(xml: string) {
  const items: { title: string; link: string; description: string; pubDate: string }[] = [];
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ||
    [];

  for (const block of blocks) {
    const title = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const link =
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
      "";
    const description = stripHtml(
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ||
        block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ||
        ""
    );
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() ||
      "";

    if (title && link) items.push({ title, link, description, pubDate });
  }

  return items;
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = (text || "").toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function guessCategory(text: string, kind?: string): string {
  const lower = `${text || ""} ${kind || ""}`.toLowerCase();
  if (/loan|grant|fund|finance|tender|bursary|scholarship/.test(lower)) return "financial";
  if (/job|employment|training|skills|nys|ajira|volunteer/.test(lower)) return "employment";
  if (/health|medical|hospital|sha|nhif/.test(lower)) return "health";
  if (/legal|court|lawyer/.test(lower)) return "legal";
  if (/housing|nyumba|boma/.test(lower)) return "housing";
  return "financial";
}

function idFromLink(link: string): string {
  return `live-${crypto.createHash("sha256").update(link).digest("hex").slice(0, 12)}`;
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "FaidaDashboard/1.0 (Kenya benefits scraper)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function itemToOpportunity(
  item: { title: string; link: string; description: string; pubDate: string },
  sourceName: string
): ScrapedOpportunity | null {
  if (!isVerifiedUrl(item.link)) return null;
  const text = `${item.title} ${item.description}`;
  return {
    id: idFromLink(item.link),
    source: "rss",
    source_name: sourceName,
    link: item.link,
    name: item.title.slice(0, 120),
    provider: sourceName,
    category: guessCategory(text),
    emoji: "🆕",
    description: item.description || item.title,
    amount: "See official announcement",
    how_to_apply: `Visit the official link for full application details.\n${item.link}`,
    documents: "See official link",
    deadline: item.pubDate ? `Published: ${item.pubDate}` : "Check official link",
    eligibility: { ...DEFAULT_ELIGIBILITY },
    raw_payload: { title: item.title, pubDate: item.pubDate },
  };
}

function mapMtajiRow(row: Record<string, unknown>): ScrapedOpportunity | null {
  if (!row?.id || !row?.title) return null;
  if (row.listing_status && row.listing_status !== "published") return null;

  const id = String(row.id);
  const link = `https://www.m-taji.co.ke/opportunities/${id}`;
  const applyLink =
    row.apply_url && isVerifiedUrl(String(row.apply_url)) ? String(row.apply_url) : link;
  const text = `${row.title} ${row.description || ""} ${row.organization || ""} ${row.kind || ""}`;

  return {
    id: `mtaji-${crypto.createHash("sha256").update(id).digest("hex").slice(0, 12)}`,
    source: "mtaji",
    source_name: "M-Taji (Partner)",
    link,
    name: String(row.title).slice(0, 120),
    provider: String(row.organization || "M-Taji"),
    category: guessCategory(text, String(row.kind || "")),
    emoji: "🤝",
    description:
      String(row.description || "") ||
      `${row.title} — listed on M-Taji, Faida's partner platform.`,
    amount: String(row.amount || "See listing for details"),
    how_to_apply: row.how_to_apply
      ? `${row.how_to_apply}\n\nApply: ${applyLink}`
      : `View and apply on M-Taji:\n${link}`,
    documents: "See M-Taji listing",
    deadline: row.deadline ? `Deadline: ${row.deadline}` : "Check listing for deadline",
    eligibility: { ...DEFAULT_ELIGIBILITY },
    raw_payload: row,
  };
}

function cdata(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "cdata!" in value) {
    return String((value as { "cdata!": string })["cdata!"] || "");
  }
  return String(value);
}

function normalizeUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

async function fetchMtajiOpportunities(): Promise<ScrapedOpportunity[]> {
  const base = process.env.MTAJI_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.MTAJI_SUPABASE_ANON_KEY;
  if (!base || !key) {
    console.log("[scraper] M-Taji skipped — MTAJI_SUPABASE_URL or MTAJI_SUPABASE_ANON_KEY not set");
    return [];
  }

  const url =
    `${base}/rest/v1/opportunities` +
    "?select=*" +
    "&listing_status=eq.published" +
    "&order=created_at.desc" +
    "&limit=50";

  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.warn("[scraper] M-Taji fetch failed:", res.status, await res.text());
    return [];
  }

  const rows = (await res.json()) as Record<string, unknown>[];
  console.log("[scraper] M-Taji rows:", rows.length);
  return rows.map(mapMtajiRow).filter(Boolean) as ScrapedOpportunity[];
}

/**
 * World Bank JSON news API (RSS endpoints often return 404/403).
 */
async function fetchWorldBankNews(): Promise<ScrapedOpportunity[]> {
  const apiUrl =
    "https://search.worldbank.org/api/v2/news?format=json&rows=25&qterm=kenya";
  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "FaidaDashboard/1.0 (Kenya benefits scraper)" },
  });
  if (!res.ok) {
    console.warn("[scraper] World Bank API failed:", res.status);
    return [];
  }

  const data = (await res.json()) as {
    documents?: Record<string, Record<string, unknown>>;
  };
  const docs = Object.values(data.documents || {});
  const keywords = ["kenya", "grant", "fund", "youth", "sme", "africa"];
  const out: ScrapedOpportunity[] = [];

  for (const doc of docs) {
    const title = cdata(doc.title);
    const description = cdata(doc.descr);
    const link = normalizeUrl(String(doc.url || ""));
    const text = `${title} ${description} ${doc.keywd || ""}`;

    if (!title || !link || !isVerifiedUrl(link)) continue;
    if (!matchesKeywords(text, keywords)) continue;

    const opp = itemToOpportunity(
      { title, link, description, pubDate: String(doc.display_date || "") },
      "World Bank — News"
    );
    if (opp) out.push(opp);
  }

  console.log("[scraper] World Bank API items:", out.length);
  return out;
}

export type ScrapeDebug = {
  mtaji: number;
  worldBank: number;
  rss: number;
  total: number;
  errors: string[];
};

/**
 * Scrapes verified sources and M-Taji, deduped by link.
 */
export async function scrapeVerifiedOpportunities(): Promise<ScrapedOpportunity[]> {
  const { opportunities } = await scrapeVerifiedOpportunitiesWithDebug();
  return opportunities;
}

export async function scrapeVerifiedOpportunitiesWithDebug(): Promise<{
  opportunities: ScrapedOpportunity[];
  debug: ScrapeDebug;
}> {
  const merged: ScrapedOpportunity[] = [];
  const seenLinks = new Set<string>();
  const errors: string[] = [];
  let mtajiCount = 0;
  let worldBankCount = 0;
  let rssCount = 0;

  try {
    const fromMtaji = await fetchMtajiOpportunities();
    mtajiCount = fromMtaji.length;
    for (const opp of fromMtaji) {
      if (seenLinks.has(opp.link)) continue;
      seenLinks.add(opp.link);
      merged.push(opp);
    }
  } catch (err) {
    errors.push(`M-Taji: ${err instanceof Error ? err.message : "failed"}`);
  }

  try {
    const fromWorldBank = await fetchWorldBankNews();
    worldBankCount = fromWorldBank.length;
    for (const opp of fromWorldBank) {
      if (seenLinks.has(opp.link)) continue;
      seenLinks.add(opp.link);
      merged.push(opp);
    }
  } catch (err) {
    errors.push(`World Bank: ${err instanceof Error ? err.message : "failed"}`);
  }

  for (const feed of VERIFIED_FEEDS) {
    try {
      const xml = await fetchWithTimeout(feed.url);
      const items = parseRssItems(xml);
      let feedCount = 0;
      for (const item of items) {
        const text = `${item.title} ${item.description}`;
        if (!matchesKeywords(text, feed.keywords)) continue;
        const opp = itemToOpportunity(item, feed.name);
        if (!opp || seenLinks.has(opp.link)) continue;
        seenLinks.add(opp.link);
        merged.push(opp);
        feedCount++;
      }
      rssCount += feedCount;
      console.log(`[scraper] RSS ${feed.id}:`, feedCount, "items");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "failed";
      errors.push(`RSS ${feed.id}: ${msg}`);
      console.warn(`[scraper] RSS ${feed.id} failed:`, msg);
    }
  }

  console.log("[scraper] total merged:", merged.length, { mtajiCount, worldBankCount, rssCount, errors });

  return {
    opportunities: merged,
    debug: {
      mtaji: mtajiCount,
      worldBank: worldBankCount,
      rss: rssCount,
      total: merged.length,
      errors,
    },
  };
}
