/**
 * Faida Benefits Database
 * ──────────────────────────────────────────────────────────
 * Each benefit has:
 *   - id, name, provider, category
 *   - description: plain-language explanation
 *   - amount: what you can get
 *   - howToApply: exact steps
 *   - documents: what to bring/prepare
 *   - deadline: when to apply (or "Rolling")
 *   - deadlineDate: optional MM-DD or YYYY-MM-DD for reminder system
 *   - deadlineAnnual: optional boolean — repeats deadlineDate every year
 *   - link: official URL
 *   - eligibility: object of criteria used for matching
 *       - minAge / maxAge
 *       - gender: "any" | "female" | "male"
 *       - employed: true | false | "any"
 *       - businessOwner: true | false | "any"
 *       - disability: true | false | "any"
 *       - counties: ["any"] or specific list
 *       - sectors: ["any"] or specific list
 *       - groupRequired: true | false
 */

const benefits = require("./benefits.json");
module.exports = benefits;
