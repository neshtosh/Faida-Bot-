/**
 * Faida Eligibility Engine
 * ──────────────────────────────────────────────────────────
 * Matches user profiles to benefits and live opportunities using
 * structured rules plus keyword relevance scoring.
 */

const staticBenefits = require("../db/benefits");
const { getCachedOpportunitiesAsBenefits } = require("./opportunities");

/** Common stop-words to ignore when keyword matching. */
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "what", "which", "about",
  "have", "need", "want", "can", "you", "are", "any", "how", "where", "when",
  "grant", "grants", "fund", "funds", "help", "find", "looking", "apply",
  "kenya", "kenyan", "please", "me", "my", "i", "a", "an", "to", "in", "on",
  "na", "ya", "kwa", "ni", "nini", "nataka", "tafuta", "fursa", "ruzuku",
]);

/**
 * Returns static benefits plus verified live opportunities.
 */
function getAllBenefits() {
  return [...staticBenefits, ...getCachedOpportunitiesAsBenefits()];
}

/**
 * Builds searchable text from a benefit or opportunity record.
 */
function buildBenefitSearchText(benefit) {
  return [
    benefit.name,
    benefit.provider,
    benefit.description,
    benefit.amount,
    benefit.category,
    benefit.sourceName,
    benefit.howToApply,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Extracts meaningful query terms from user text.
 */
function extractQueryTerms(query) {
  if (!query) return [];
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Scores keyword overlap between a benefit and a search query.
 */
function scoreQueryKeywords(benefit, query) {
  const terms = extractQueryTerms(query);
  if (terms.length === 0) return { bonus: 0, reasons: [] };

  const text = buildBenefitSearchText(benefit);
  let bonus = 0;
  const reasons = [];

  for (const term of terms) {
    if (text.includes(term)) {
      bonus += 4;
      if (reasons.length < 3) reasons.push(`matches "${term}"`);
    }
  }

  // Phrase bonus for multi-word queries
  const phrase = query.toLowerCase().trim();
  if (phrase.length > 5 && text.includes(phrase)) {
    bonus += 8;
    reasons.push("strong text match");
  }

  return { bonus, reasons };
}

/**
 * Score a single benefit against a user profile.
 */
function scoreBenefit(benefit, user, query = null) {
  const e = benefit.eligibility || {};
  const reasons = [];
  let score = 0;
  let disqualified = false;

  // ── Age ──────────────────────────────────────────────────
  if (user.age < e.minAge || user.age > e.maxAge) {
    disqualified = true;
  } else {
    score += 10;
  }

  // ── Gender ───────────────────────────────────────────────
  if (e.gender !== "any" && user.gender !== "unknown" && e.gender !== user.gender) {
    disqualified = true;
  } else if (e.gender === user.gender) {
    score += 5;
    if (e.gender === "female") {
      reasons.push("designed for women entrepreneurs");
    }
  }

  // ── County ───────────────────────────────────────────────
  if (
    e.counties &&
    !e.counties.includes("any") &&
    user.county &&
    user.county !== "Unknown"
  ) {
    const countyLower = user.county.toLowerCase();
    const matchesCounty = e.counties.some((c) => c.toLowerCase() === countyLower);
    if (!matchesCounty) {
      score -= 5;
    } else {
      score += 8;
      reasons.push(`available in ${user.county}`);
    }
  }

  // ── Employment status ────────────────────────────────────
  if (e.employed !== "any" && e.employed !== user.employed) {
    score -= 3;
  } else if (e.employed !== "any") {
    score += 5;
  }

  // ── Business owner ───────────────────────────────────────
  if (e.businessOwner === true && !user.businessOwner) {
    disqualified = true;
  } else if (e.businessOwner === true && user.businessOwner) {
    score += 10;
    reasons.push("for business owners");
  } else if (e.businessOwner === false && user.businessOwner) {
    score -= 2;
  }

  // ── Disability ───────────────────────────────────────────
  if (e.disability === true && !user.disability) {
    disqualified = true;
  } else if (e.disability === true && user.disability) {
    score += 15;
    reasons.push("specifically supports persons with disabilities");
  }

  // ── Safaricom ────────────────────────────────────────────
  if (e.safaricomRequired && !user.hasSafaricom) {
    disqualified = true;
  }

  // ── Group required ───────────────────────────────────────
  if (e.groupRequired) {
    score -= 3;
    reasons.push("requires a registered group");
  }

  // ── Category filter ──────────────────────────────────────
  if (
    user.categoriesWanted &&
    user.categoriesWanted.length > 0 &&
    !user.categoriesWanted.includes(benefit.category)
  ) {
    disqualified = true;
  }

  // ── Keyword relevance (profile interests + live query) ───
  const profileKeywords = (user.categoriesWanted || []).join(" ");
  const profileKw = scoreQueryKeywords(benefit, profileKeywords);
  score += Math.min(profileKw.bonus, 12);

  if (query) {
    const queryKw = scoreQueryKeywords(benefit, query);
    score += queryKw.bonus;
    reasons.push(...queryKw.reasons);
  }

  // ── Live / partner opportunity boost ─────────────────────
  if (benefit.partner === "m-taji" || benefit.verified) {
    score += 3;
  }

  // ── Bonus: accessible programmes ─────────────────────────
  if (!e.groupRequired && (benefit.deadline || "").toLowerCase().includes("rolling")) {
    score += 5;
    reasons.push("available right now, no deadline pressure");
  }

  if (disqualified) return { matches: false, score: 0, reasons: [] };

  return { matches: true, score, reasons: [...new Set(reasons)] };
}

/**
 * Match a user profile against all benefits, optionally ranked by query.
 */
function matchBenefits(userProfile, query = null) {
  const results = [];

  for (const benefit of getAllBenefits()) {
    const { matches, score, reasons } = scoreBenefit(benefit, userProfile, query);
    if (matches) {
      results.push({ benefit, score, reasons });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Format a matched benefit into a WhatsApp-friendly message block.
 */
function formatBenefitCard(result, index) {
  const { benefit, reasons } = result;
  const reasonText = reasons.length > 0 ? `\n_Why you qualify: ${reasons.join(", ")}_` : "";

  return (
    `*${index}. ${benefit.emoji} ${benefit.name}*\n` +
    `Provider: ${benefit.provider}\n` +
    `Amount: ${benefit.amount}\n` +
    `${reasonText}\n` +
    `Reply *D${index}* to see how to apply`
  );
}

/**
 * Format the full application details for a specific benefit.
 */
function formatApplicationDetails(benefit) {
  return (
    `*${benefit.emoji} ${benefit.name}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*What you get:*\n${benefit.amount}\n\n` +
    `*About this benefit:*\n${benefit.description}\n\n` +
    `*How to apply:*\n${benefit.howToApply}\n\n` +
    `*Documents you need:*\n${benefit.documents}\n\n` +
    `*Deadline:* ${benefit.deadline}\n\n` +
    `*Official link:* ${benefit.link}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Reply *MENU* to check other benefits\n` +
    `Reply *SHARE* to share Faida with someone`
  );
}

module.exports = {
  matchBenefits,
  formatBenefitCard,
  formatApplicationDetails,
  getAllBenefits,
  buildBenefitSearchText,
  extractQueryTerms,
  scoreQueryKeywords,
};
