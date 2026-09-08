/**
 * Faida Web Form Assistant
 * ──────────────────────────────────────────────────────────
 * Guides users through forms discovered on verified websites,
 * prefilling from their Faida profile where possible.
 */

const crypto = require("crypto");
const { fetchVerifiedPage } = require("./webfetch");

/**
 * Maps profile keys to common form field names.
 */
const PROFILE_ALIASES = {
  fullName: ["name", "full_name", "fullname", "applicant_name"],
  idNumber: ["id", "id_number", "national_id", "idno"],
  phoneNumber: ["phone", "mobile", "tel", "msisdn", "phone_number"],
  email: ["email", "email_address"],
  county: ["county"],
};

/**
 * Attempts to prefill a field from the user profile.
 */
function prefillFromProfile(field, profile) {
  const keyLower = field.key.toLowerCase();
  const labelLower = (field.label || "").toLowerCase();

  for (const [profileKey, aliases] of Object.entries(PROFILE_ALIASES)) {
    const val = profile[profileKey];
    if (!val) continue;
    if (
      keyLower.includes(profileKey.toLowerCase()) ||
      aliases.some((a) => keyLower.includes(a) || labelLower.includes(a.replace(/_/g, " ")))
    ) {
      return String(val);
    }
  }

  if (profile.age && (keyLower.includes("age") || labelLower.includes("age"))) {
    return String(profile.age);
  }
  if (profile.county && (keyLower.includes("county") || labelLower.includes("county"))) {
    return String(profile.county);
  }

  return null;
}

/**
 * Creates default fields when a page has no HTML form tags.
 */
function buildFallbackFields(page) {
  return [
    { key: "fullName", label: "Full name", type: "text", required: true },
    { key: "idNumber", label: "National ID number", type: "text", required: true },
    { key: "phoneNumber", label: "Phone number", type: "phone", required: true },
    { key: "county", label: "County", type: "text", required: true },
    { key: "notes", label: "Additional details for this application", type: "text", required: false },
  ];
}

/**
 * Starts a web form session from a verified URL.
 */
async function startWebFormFromUrl(url, profile = {}) {
  const page = await fetchVerifiedPage(url);
  let fields = page.fields.length > 0 ? page.fields : buildFallbackFields(page);

  const answers = {};
  for (const field of fields) {
    const prefilled = prefillFromProfile(field, profile);
    if (prefilled) answers[field.key] = prefilled;
  }

  const refCode = `WEB-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  return {
    sourceUrl: page.url,
    title: page.title,
    pageText: page.text,
    fields,
    answers,
    currentFieldIndex: 0,
    submitAction: page.submitAction,
    submitMethod: page.submitMethod,
    refCode,
    startedAt: Date.now(),
  };
}

/**
 * Returns the next unanswered field index, skipping prefilled fields optionally.
 */
function findNextFieldIndex(webForm) {
  for (let i = webForm.currentFieldIndex; i < webForm.fields.length; i++) {
    const field = webForm.fields[i];
    const val = webForm.answers[field.key];
    if (val === undefined || val === null || val === "") {
      return i;
    }
  }
  return webForm.fields.length;
}

/**
 * Returns true when all required fields have answers.
 */
function isWebFormComplete(webForm) {
  return webForm.fields.every((field) => {
    if (!field.required) return true;
    const val = webForm.answers[field.key];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });
}

/**
 * Validates and stores an answer for the current field.
 */
function answerCurrentField(webForm, rawValue) {
  const idx = findNextFieldIndex(webForm);
  if (idx >= webForm.fields.length) {
    return { ok: false, error: "Form is already complete. Type PDF to export." };
  }

  const field = webForm.fields[idx];
  const value = (rawValue || "").trim();

  if (!value && field.required) {
    return { ok: false, error: "This field is required." };
  }

  if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (value && field.type === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 9) {
      return { ok: false, error: "Enter a valid phone number." };
    }
  }

  const answers = { ...webForm.answers };
  if (value) answers[field.key] = value;

  const nextIndex = idx + 1;
  return {
    ok: true,
    webForm: {
      ...webForm,
      answers,
      currentFieldIndex: nextIndex,
    },
    complete: nextIndex >= webForm.fields.length || isWebFormComplete({ ...webForm, answers }),
  };
}

/**
 * Formats the filled form as WhatsApp text.
 */
function formatWebFormDocument(webForm, lang = "en") {
  const isSw = lang === "sw";
  let body = isSw ? `FAIDA — FOMU ILIOJWA KUTOKA TOVUTI\n` : `FAIDA — WEB FORM (PRE-FILLED)\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `${isSw ? "Kichwa" : "Title"}: ${webForm.title}\n`;
  body += `${isSw ? "Chanzo" : "Source"}: ${webForm.sourceUrl}\n`;
  body += `${isSw ? "Msimbo" : "Reference"}: *${webForm.refCode}*\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const field of webForm.fields) {
    const val = webForm.answers[field.key];
    if (!val) continue;
    body += `*${field.label}:*\n${val}\n\n`;
  }

  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += isSw
    ? `Andika *PDF* kupata faili ya kuchapisha.\nAndika *SUBMIT* kuwasilisha pale inaporuhusiwa.\n`
    : `Type *PDF* to get a printable file.\nType *SUBMIT* to submit where supported.\n`;

  return body;
}

module.exports = {
  startWebFormFromUrl,
  findNextFieldIndex,
  isWebFormComplete,
  answerCurrentField,
  formatWebFormDocument,
  buildFallbackFields,
};
