/**
 * Faida Verified Web Search
 * ──────────────────────────────────────────────────────────
 * Searches Faida's verified catalog (benefits + live opportunities)
 * before optionally fetching a verified page.
 */

const staticBenefits = require("../db/benefits");
const { getCachedOpportunitiesAsBenefits } = require("./opportunities");
const { fetchVerifiedPage } = require("./webfetch");

/**
 * Scores how well an item matches a search query.
 */
function scoreMatch(query, item) {
  const hay = `${item.name} ${item.provider} ${item.description || ""} ${item.category || ""}`.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 2;
  }
  if (hay.includes(query.toLowerCase())) score += 3;
  return score;
}

/**
 * Searches verified benefits and live opportunities.
 */
function searchVerifiedCatalog(query, limit = 8) {
  const profile = { age: 30, gender: "unknown", county: "Unknown", employed: false, businessOwner: false, disability: false, hasSafaricom: true, categoriesWanted: ["financial", "health", "employment", "legal", "housing"] };
  const { matchBenefits } = require("./eligibility");
  return matchBenefits(profile, query)
    .slice(0, limit)
    .map((r) => ({
      id: r.benefit.id,
      name: r.benefit.name,
      provider: r.benefit.provider,
      link: r.benefit.link,
      category: r.benefit.category,
      sourceName: r.benefit.sourceName || "Faida database",
      score: r.score,
    }));
}

/**
 * Searches catalog and optionally fetches the top matching page.
 */
async function searchAndFetch(query, fetchTopPage = false) {
  const results = searchVerifiedCatalog(query, 5);
  let page = null;

  if (fetchTopPage && results[0]?.link) {
    try {
      page = await fetchVerifiedPage(results[0].link);
    } catch (_) {
      page = null;
    }
  }

  return { results, page };
}

module.exports = { searchVerifiedCatalog, searchAndFetch, scoreMatch };
