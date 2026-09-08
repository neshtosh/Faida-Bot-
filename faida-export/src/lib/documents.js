/**
 * Faida Pre-filled Application Document Generator
 * ──────────────────────────────────────────────────────────
 * Generates WhatsApp-friendly text documents and printable
 * pre-filled application forms from user answers.
 */

const { BENEFIT_FORM_MAP } = require("./applications");
const benefits = require("../db/benefits");

const FIELD_LABELS_EN = {
  fullName: "Full Name",
  idNumber: "National ID Number",
  phoneNumber: "Phone Number",
  email: "Email Address",
  county: "County",
  constituency: "Constituency",
  ward: "Ward",
  businessName: "Business Name",
  businessRegNo: "Business Registration No.",
  kraPin: "KRA PIN",
  businessSector: "Business Sector",
  businessAge: "Months in Operation",
  monthlyRevenue: "Approx. Monthly Revenue",
  loanAmountRequested: "Amount Requested (Ksh)",
  businessPlanDescription: "Business / Use of Funds Description",
  groupName: "Group Name",
  groupRegNo: "Group Registration No.",
  groupMembersCount: "Number of Members",
  studentName: "Student's Full Name",
  studentIdNumber: "Student's ID / Birth Cert No.",
  institutionName: "Name of School / College",
  courseLevel: "Level of Study",
  admissionNumber: "Admission Number",
  feesBalance: "Fees Balance (Ksh)",
  parentGuardianName: "Parent / Guardian Name",
  parentGuardianId: "Parent / Guardian ID No.",
  bankName: "Bank Name",
  bankAccountNumber: "Bank Account No.",
  mpesaNumber: "M-Pesa Number",
  disabilityType: "Type of Disability",
  ncpwdCertNumber: "NCPWD Certificate No.",
  assistiveDeviceNeeded: "Support Required",
  legalIssueType: "Type of Legal Issue",
  legalCaseSummary: "Case Summary",
  courtOrStation: "Court / Police Station",
  dependantsCount: "No. of Dependants",
  kcseGrade: "KCSE Grade",
  preferredSector: "Preferred Training Sector",
  preferredCounty: "Preferred County (Housing)",
  unitType: "Preferred Unit Type",
  monthlyBudget: "Monthly Housing Budget (Ksh)",
  householdMembers: "Household Size",
  eligibilityCategory: "Category (Social Protection)",
  loanAmountMobile: "Loan Amount Requested (Ksh)",
  confirmTerms: "Terms & Conditions Agreement",
  agpoAware: "AGPO Certificate Status",
  pitchDeckUrl: "Pitch Deck / Website Link",
  employeesCount: "Full-time Employees",
};

const FIELD_LABELS_SW = {
  fullName: "Jina Kamili",
  idNumber: "Nambari ya Kitambulisho",
  phoneNumber: "Nambari ya Simu",
  email: "Barua Pepe",
  county: "Kaunti",
  constituency: "Uchaguzi",
  ward: "Wadi",
  businessName: "Jina la Biashara",
  businessRegNo: "Nambari ya Usajili wa Biashara",
  kraPin: "PIN ya KRA",
  businessSector: "Sekta ya Biashara",
  businessAge: "Miezi ya Biashara",
  monthlyRevenue: "Mapato ya Kila Mwezi (takriban)",
  loanAmountRequested: "Kiasi Kilichoomba (Ksh)",
  businessPlanDescription: "Maelezo ya Biashara / Matumizi ya Fedha",
  groupName: "Jina la Kikundi",
  groupRegNo: "Nambari ya Usajili wa Kikundi",
  groupMembersCount: "Idadi ya Washiriki",
  studentName: "Jina Kamili la Mwanafunzi",
  studentIdNumber: "Kitambulisho / Cheti cha Kuzaliwa",
  institutionName: "Jina la Shule / Koleti",
  courseLevel: "Kiwango cha Masomo",
  admissionNumber: "Nambari ya Kuandikishwa",
  feesBalance: "Sala ya Karo (Ksh)",
  parentGuardianName: "Jina la Mzazi / Malazi",
  parentGuardianId: "Kitambulisho cha Mzazi / Malazi",
  bankName: "Jina la Benki",
  bankAccountNumber: "Nambari ya Akaunti ya Benki",
  mpesaNumber: "Nambari ya M-Pesa",
  disabilityType: "Aina ya Ulemavu",
  ncpwdCertNumber: "Nambari ya Cheti cha NCPWD",
  assistiveDeviceNeeded: "Msaada Unahitajika",
  legalIssueType: "Aina ya Tatizo la Kisheria",
  legalCaseSummary: "Muhtasari wa Kesi",
  courtOrStation: "Korti / Kituo cha Polisi",
  dependantsCount: "Watu Unaowategemea",
  kcseGrade: "Daraja la KCSE",
  preferredSector: "Sekta ya Mafunzo Inayopendelea",
  preferredCounty: "Kaunti Unayopendelea (Nyumba)",
  unitType: "Aina ya Nyumba",
  monthlyBudget: "Bajeti ya Nyumba kwa Mwezi (Ksh)",
  householdMembers: "Idadi ya Watu Kwenye Nyumba",
  eligibilityCategory: "Kategoria (Kulinda Jamii)",
  loanAmountMobile: "Kiasi cha Mkopo (Ksh)",
  confirmTerms: "Makubaliano ya Sheria",
  agpoAware: "Hali ya Cheti cha AGPO",
  pitchDeckUrl: "Kiungo cha Pitch Deck / Tovuti",
  employeesCount: "Wafanyakazi wa Muda Wote",
};

function getFieldLabel(key, lang) {
  const labels = lang === "sw" ? FIELD_LABELS_SW : FIELD_LABELS_EN;
  return labels[key] || key;
}

function humanizeValue(key, value, lang) {
  if (value === null || value === undefined || value === "" || value === "SKIPPED") {
    return lang === "sw" ? "(Hakujazwa)" : "(Not provided)";
  }

  const optMap = {
    businessSector: BENEFIT_FORM_MAP._templates["loans-personal"].find((f) => f.key === "businessSector")?.options,
    monthlyRevenue: BENEFIT_FORM_MAP._templates["loans-personal"].find((f) => f.key === "monthlyRevenue")?.options,
    courseLevel: BENEFIT_FORM_MAP._templates["education-bursary"].find((f) => f.key === "courseLevel")?.options,
    bankName: BENEFIT_FORM_MAP._templates["loans-personal"].find((f) => f.key === "bankName")?.options,
    disabilityType: BENEFIT_FORM_MAP._templates["health-disability"].find((f) => f.key === "disabilityType")?.options,
    assistiveDeviceNeeded: BENEFIT_FORM_MAP._templates["health-disability"].find((f) => f.key === "assistiveDeviceNeeded")?.options,
    legalIssueType: BENEFIT_FORM_MAP._templates["legal-aid"].find((f) => f.key === "legalIssueType")?.options,
    preferredSector: BENEFIT_FORM_MAP._templates["employment-training"].find((f) => f.key === "preferredSector")?.options,
    unitType: BENEFIT_FORM_MAP._templates["housing-boma"].find((f) => f.key === "unitType")?.options,
    eligibilityCategory: BENEFIT_FORM_MAP._templates["social-cash"].find((f) => f.key === "eligibilityCategory")?.options,
    confirmTerms: BENEFIT_FORM_MAP._templates["instant-mobile"].find((f) => f.key === "confirmTerms")?.options,
    agpoAware: BENEFIT_FORM_MAP._templates["agpo-tenders"].find((f) => f.key === "agpoAware")?.options,
  };

  if (optMap[key]) {
    const opt = optMap[key].find((o) => o.value === value);
    if (opt) return lang === "sw" ? opt.label_sw : opt.label_en;
  }

  if (key === "businessAge" && typeof value === "number") {
    const years = Math.floor(value / 12);
    const months = value % 12;
    if (years && months) {
      return lang === "sw" ? `${years} miaka na ${months} miezi` : `${years} years, ${months} months`;
    }
    if (years) return lang === "sw" ? `${years} miaka` : `${years} years`;
    return lang === "sw" ? `${months} miezi` : `${value} months`;
  }

  if (["loanAmountRequested", "feesBalance", "monthlyBudget", "loanAmountMobile", "employeesCount", "dependantsCount", "householdMembers", "groupMembersCount"].includes(key) && typeof value === "number") {
    return value.toLocaleString("en-KE");
  }

  return String(value);
}

function generateReferenceCode(benefitId, userIdHashPart) {
  const prefix = benefitId
    .split("-")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const date = new Date();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const shortHash = userIdHashPart || "FAIDA";
  return `${prefix}-${mm}${dd}-${rand}${shortHash.slice(0, 2)}`;
}

function formatApplicationDocument(benefit, answers, templateId, lang, refCode) {
  const isSw = lang === "sw";
  const template = BENEFIT_FORM_MAP._templates[templateId] || BENEFIT_FORM_MAP._templates["loans-personal"];
  const fields = template.filter((f) => Object.keys(answers).includes(f.key) || answers[f.key] !== undefined);

  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat(isSw ? "sw-KE" : "en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Nairobi",
  });

  let body = "";
  body += isSw ? `FAIDA — FOMU YA MAOMBI ILIOJWA KISHA\n` : `FAIDA — PRE-FILLED APPLICATION FORM\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += (isSw ? `Fursa: ` : `Benefit: `) + `${benefit.emoji} ${benefit.name}\n`;
  body += (isSw ? `Mtoa huduma: ` : `Provider: `) + `${benefit.provider}\n`;
  body += (isSw ? `Msimbo wa Kumbukumbu: ` : `Reference Code: `) + `*${refCode}*\n`;
  body += (isSw ? `Tarehe: ` : `Date: `) + `${dateFormatter.format(now)}\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  body += (isSw ? `── MAELEZO YA MTU ──\n\n` : `── PERSONAL DETAILS ──\n\n`);
  let writtenCount = 0;
  for (const field of template) {
    const val = answers[field.key];
    if (val === undefined || val === null || val === "") continue;
    const label = getFieldLabel(field.key, lang);
    const humanVal = humanizeValue(field.key, val, lang);
    body += `  ${label}:\n    ${humanVal}\n\n`;
    writtenCount++;
  }

  if (writtenCount === 0) {
    body += (isSw ? `  (Hakuna majibu yaliyo hifadhiwa kwa sasa)\n\n` : `  (No answers captured yet)\n\n`);
  }

  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += isSw
    ? `SAITI / KUTHIBITISHA\n\n`
    : `DECLARATION / SIGNATURE\n\n`;
  body += isSw
    ? `Mimi, ${answers.fullName || "______________________"}, nafanya uthibitisho kwamba\n` +
      `taarifa zote kwenye fomu hii ni za kweli.\n\n`
    : `I, ${answers.fullName || "______________________"}, declare that all information\n` +
      `provided in this form is true and accurate.\n\n`;
  body += isSw ? `Sahihi: ___________________\n` : `Signature: ___________________\n`;
  body += isSw ? `Tarehe: ${dateFormatter.format(now)}\n\n` : `Date: ${dateFormatter.format(now)}\n\n`;

  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += isSw
    ? `📎 VIAMBISHI VYA KITOA KWENYE OFISI:\n\n`
    : `📎 DOCUMENTS TO BRING TO THE OFFICE:\n\n`;
  const docs = benefit.documents ? benefit.documents.split(", ") : [];
  for (const doc of docs) {
    body += `  ☐ ${doc.trim()}\n`;
  }
  body += `\n`;
  body += isSw
    ? `Tumia Msimbo wa Kumbukumbu *${refCode}* wakati wa utuzi.\n`
    : `Quote Reference Code *${refCode}* when submitting.\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  return body;
}

function formatShortSummary(benefit, answers, lang) {
  const isSw = lang === "sw";
  const previewKeys = ["fullName", "idNumber", "phoneNumber", "county"];
  const lines = [];

  for (const key of previewKeys) {
    const val = answers[key];
    if (val === undefined || val === null || val === "") continue;
    lines.push(`  ${getFieldLabel(key, lang)}: ${humanizeValue(key, val, lang)}`);
  }

  return lines.join("\n");
}

module.exports = {
  generateReferenceCode,
  formatApplicationDocument,
  formatShortSummary,
  getFieldLabel,
  humanizeValue,
  FIELD_LABELS_EN,
  FIELD_LABELS_SW,
};
