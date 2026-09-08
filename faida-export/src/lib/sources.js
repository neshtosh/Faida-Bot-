/**
 * Faida Verified Sources
 * ──────────────────────────────────────────────────────────
 * Allowlist of trusted domains and official RSS feeds used when
 * pulling live opportunities from the web. Links outside this
 * list are never shown to users.
 */

/** Official domain suffixes and hostnames allowed for opportunity links. */
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
];

/** Official RSS/Atom feeds to poll for new announcements. */
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

/**
 * Returns true if a URL belongs to a verified source domain.
 */
function isVerifiedUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;

  try {
    const host = new URL(urlString).hostname.toLowerCase();
    return VERIFIED_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch (_) {
    return false;
  }
}

/**
 * Returns the configured verified RSS feeds.
 */
function getVerifiedFeeds() {
  return VERIFIED_FEEDS;
}

module.exports = { VERIFIED_DOMAINS, VERIFIED_FEEDS, isVerifiedUrl, getVerifiedFeeds };
