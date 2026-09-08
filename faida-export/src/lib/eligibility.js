/**
 * Faida Eligibility Engine
 * ──────────────────────────────────────────────────────────
 * Takes a user profile and returns matched + scored benefits.
 *
 * User profile shape:
 * {
 *   age: number,
 *   gender: "male" | "female",
 *   county: string,
 *   employed: boolean,
 *   businessOwner: boolean,
 *   disability: boolean,
 *   sector: string,         // "tech" | "agriculture" | "retail" | "services" | "other"
 *   hasSafaricom: boolean,
 *   categoriesWanted: string[]  // ["financial","health","employment","legal","housing"]
 * }
 */

const benefits = require("../db/benefits");

/**
 * Score a single benefit against a user profile.
 * Returns { matches: boolean, score: number, reasons: string[] }
 */
function scoreBenefit(benefit, user) {
  const e = benefit.eligibility;
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

  // ── Employment status ────────────────────────────────────
  if (e.employed !== "any" && e.employed !== user.employed) {
    // Not a hard disqualifier for most funds — just lower score
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

  // ── Category filter (user only wants certain categories) ──
  if (
    user.categoriesWanted &&
    user.categoriesWanted.length > 0 &&
    !user.categoriesWanted.includes(benefit.category)
  ) {
    disqualified = true;
  }

  // ── Bonus: accessible (no group required, rolling deadline) ─
  if (!e.groupRequired && benefit.deadline.toLowerCase().includes("rolling")) {
    score += 5;
    reasons.push("available right now, no deadline pressure");
  }

  if (disqualified) return { matches: false, score: 0, reasons: [] };

  return { matches: true, score, reasons };
}

/**
 * Match a user profile against all benefits.
 * Returns array of { benefit, score, reasons } sorted by score desc.
 */
function matchBenefits(userProfile) {
  const results = [];

  for (const benefit of benefits) {
    const { matches, score, reasons } = scoreBenefit(benefit, userProfile);
    if (matches) {
      results.push({ benefit, score, reasons });
    }
  }

  // Sort by score descending
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

module.exports = { matchBenefits, formatBenefitCard, formatApplicationDetails };
