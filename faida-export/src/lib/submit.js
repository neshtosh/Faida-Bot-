/**
 * Faida Partner Form Submission
 * ──────────────────────────────────────────────────────────
 * Submits filled forms to partner platforms where official APIs exist.
 * Generic government sites cannot be auto-submitted (CAPTCHA, login, etc.).
 */

const { logger } = require("./logger");

const MTAJI_OPPORTUNITY_RE = /^https:\/\/www\.m-taji\.co\.ke\/opportunities\/([a-f0-9-]+)$/i;

/**
 * Returns submission capabilities for a source URL.
 */
function getSubmissionSupport(sourceUrl) {
  if (MTAJI_OPPORTUNITY_RE.test(sourceUrl || "")) {
    return {
      supported: true,
      partner: "m-taji",
      mode: "redirect",
      message:
        "M-Taji applications are submitted on their website. Faida will open your pre-filled summary and the apply page.",
    };
  }

  return {
    supported: false,
    partner: null,
    mode: "manual",
    message:
      "Automatic submit is not available for this site. Download the PDF, then submit manually on the official website or visit the nearest office.",
  };
}

/**
 * Attempts partner submission or returns manual instructions.
 */
async function submitFilledForm(webForm, profile = {}) {
  const support = getSubmissionSupport(webForm.sourceUrl);

  if (!support.supported) {
    return {
      ok: false,
      manual: true,
      reply:
        `📋 *Submission*\n\n${support.message}\n\n` +
        `Official link: ${webForm.sourceUrl}\n\n` +
        `Reference: *${webForm.refCode}*\n` +
        `Type *PDF* if you still need a printable copy.`,
    };
  }

  if (support.partner === "m-taji") {
    const match = webForm.sourceUrl.match(MTAJI_OPPORTUNITY_RE);
    const opportunityId = match?.[1];
    const applyUrl = webForm.sourceUrl;

    logger.info(
      { event: "partner_submit_prepared", partner: "m-taji", opportunityId, refCode: webForm.refCode },
      "M-Taji submission prepared"
    );

    return {
      ok: true,
      manual: true,
      partner: "m-taji",
      applyUrl,
      reply:
        `✅ *M-Taji application ready*\n\n` +
        `Your answers are saved under reference *${webForm.refCode}*.\n\n` +
        `*Next step:* Open the official M-Taji listing and complete submission:\n` +
        `${applyUrl}\n\n` +
        `Tip: Type *PDF* to get a printable copy to carry with you.\n\n` +
        `_Faida cannot click "Submit" on your behalf for security reasons, but your form is ready to copy._`,
    };
  }

  return {
    ok: false,
    manual: true,
    reply: support.message,
  };
}

module.exports = { getSubmissionSupport, submitFilledForm, MTAJI_OPPORTUNITY_RE };
