/**
 * Faida User Profile Helpers
 * ──────────────────────────────────────────────────────────
 * Checks profile completeness and builds match input for the
 * eligibility engine.
 */

/**
 * Returns true when the user has completed the onboarding questionnaire.
 */
function isProfileComplete(session) {
  const p = session?.profile || {};
  return !!(
    session?.profileComplete ||
    (p.age &&
      p.gender !== undefined &&
      p.county &&
      Array.isArray(p.categoriesWanted) &&
      p.categoriesWanted.length > 0)
  );
}

/**
 * Converts session profile to eligibility engine input shape.
 */
function buildMatchProfile(session) {
  const p = session?.profile || {};
  return {
    age: p.age || 30,
    gender: p.gender || "unknown",
    county: p.county || "Unknown",
    employed: !!p.employed,
    businessOwner: !!p.businessOwner,
    disability: !!p.disability,
    hasSafaricom: p.hasSafaricom !== false,
    categoriesWanted: p.categoriesWanted || [],
  };
}

/**
 * Questionnaire steps where free-text should not trigger AI chat.
 */
const QUESTIONNAIRE_STEPS = new Set([
  "welcome",
  "ask_language",
  "ask_age",
  "ask_gender",
  "ask_county",
  "ask_employment",
  "ask_disability",
  "ask_categories",
]);

/**
 * Returns true if the user is still in the onboarding questionnaire.
 */
function isInQuestionnaire(step) {
  return QUESTIONNAIRE_STEPS.has(step);
}

module.exports = {
  isProfileComplete,
  buildMatchProfile,
  isInQuestionnaire,
  QUESTIONNAIRE_STEPS,
};
