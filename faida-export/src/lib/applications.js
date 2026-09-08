/**
 * Faida Application Form Schemas
 * ──────────────────────────────────────────────────────────
 * Defines step-by-step form fields for each benefit.
 * Each benefit has an ordered list of fields with:
 *   - key: unique field id
 *   - label: question shown to user (en + sw)
 *   - type: text | number | phone | email | select
 *   - placeholder: optional example text
 *   - validate: optional validator fn(value) -> {valid, error?}
 *   - options: for select type, {value, label_en, label_sw}
 */

const PERSONAL_BASIC = [
  {
    key: "fullName",
    type: "text",
    label: {
      en: "First — what is your full name as it appears on your ID?",
      sw: "Kwanza — jina lako kamili jinavyotokea kwenye kitambulisho chako ni nini?",
    },
    placeholder: "e.g. John Kamau Mwangi",
    validate: (v) => {
      if (!v || v.trim().length < 4) return { valid: false, error: "Please enter at least 2 names" };
      return { valid: true };
    },
  },
  {
    key: "idNumber",
    type: "text",
    label: {
      en: "Thank you. What is your National ID number?",
      sw: "Asante. Nambari yako ya kitambulisho cha Kitaifa ni nini?",
    },
    placeholder: "e.g. 12345678",
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 9) {
        return { valid: false, error: "ID should be 7–9 digits" };
      }
      return { valid: true };
    },
  },
  {
    key: "phoneNumber",
    type: "phone",
    label: {
      en: "What is your phone number? (for M-Pesa and callbacks)",
      sw: "Nambari yako ya simu ni nini? (kwa M-Pesa na mawasiliano)",
    },
    placeholder: "e.g. 0712345678",
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 12) {
        return { valid: false, error: "Enter a valid Kenyan phone number" };
      }
      return { valid: true };
    },
  },
  {
    key: "email",
    type: "email",
    optional: true,
    label: {
      en: "What is your email? (Optional — type SKIP to skip)",
      sw: "Barua pepe yako ni nani? (Si lazima — andika SKIP kuruka)",
    },
    placeholder: "e.g. john@example.com or SKIP",
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return { valid: false, error: "Enter a valid email or SKIP" };
      }
      return { valid: true };
    },
  },
];

const LOCATION_FIELDS = [
  {
    key: "county",
    type: "text",
    label: {
      en: "Which county do you live in?",
      sw: "Unaishi kaunti gani?",
    },
    placeholder: "e.g. Nairobi",
    validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "County name too short" }),
  },
  {
    key: "constituency",
    type: "text",
    label: {
      en: "Which constituency?",
      sw: "Uchaguzi gani?",
    },
    placeholder: "e.g. Westlands",
    validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "Constituency name too short" }),
  },
  {
    key: "ward",
    type: "text",
    label: {
      en: "Which ward?",
      sw: "Wadi gani?",
    },
    placeholder: "e.g. Kileleshwa",
    validate: (v) => (v.trim().length >= 2 ? { valid: true } : { valid: false, error: "Ward name too short" }),
  },
];

const BUSINESS_FIELDS = [
  {
    key: "businessName",
    type: "text",
    label: {
      en: "What is your business name?",
      sw: "Jina la biashara yako ni nini?",
    },
    placeholder: "e.g. Kamau General Store",
    validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "Business name too short" }),
  },
  {
    key: "businessRegNo",
    type: "text",
    optional: true,
    label: {
      en: "Business registration number? (Optional — type SKIP if unregistered)",
      sw: "Nambari ya usajili wa biashara? (Si lazima — andika SKIP)",
    },
    placeholder: "e.g. BN-1234567 or SKIP",
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      return { valid: true };
    },
  },
  {
    key: "kraPin",
    type: "text",
    label: {
      en: "What is your KRA PIN?",
      sw: "PIN yako ya KRA ni nini?",
    },
    placeholder: "e.g. A012345678Z",
    validate: (v) => {
      if (/^[A-Z0-9]{8,12}$/i.test(v.trim())) return { valid: true };
      return { valid: false, error: "Enter a valid KRA PIN (8–12 characters)" };
    },
  },
  {
    key: "businessSector",
    type: "select",
    label: {
      en: "Which sector is your business in?\n1 — Retail / Trade\n2 — Agriculture\n3 — Services\n4 — Manufacturing\n5 — Tech / ICT\n6 — Other",
      sw: "Biashara yako iko katika sekta gani?\n1 — Biashara / Mauzo\n2 — Kilimo\n3 — Huduma\n4 — Uzalishaji\n5 — Teknolojia\n6 — Nyingine",
    },
    options: [
      { value: "retail", label_en: "Retail / Trade", label_sw: "Biashara / Mauzo" },
      { value: "agriculture", label_en: "Agriculture", label_sw: "Kilimo" },
      { value: "services", label_en: "Services", label_sw: "Huduma" },
      { value: "manufacturing", label_en: "Manufacturing", label_sw: "Uzalishaji" },
      { value: "tech", label_en: "Tech / ICT", label_sw: "Teknolojia" },
      { value: "other", label_en: "Other", label_sw: "Nyingine" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 6) return { valid: true, value: ["retail", "agriculture", "services", "manufacturing", "tech", "other"][n - 1] };
      return { valid: false, error: "Reply 1–6" };
    },
  },
  {
    key: "businessAge",
    type: "number",
    label: {
      en: "How many months/years has your business been operating? (in months, e.g. 18)",
      sw: "Biashara yako imekuwa ikifanya kazi muda gani? (kwa miezi, mfano 18)",
    },
    placeholder: "e.g. 18 (1.5 years)",
    validate: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 0 || n > 600) return { valid: false, error: "Enter number of months (0–600)" };
      return { valid: true };
    },
  },
  {
    key: "monthlyRevenue",
    type: "select",
    label: {
      en: "What is your approximate monthly revenue?\n1 — Below Ksh 20,000\n2 — Ksh 20,000 – 100,000\n3 — Ksh 100,000 – 500,000\n4 — Ksh 500,000 – 1M\n5 — Above 1M",
      sw: "Mapato yako ya kila mwezi ni takriban kiasi gani?\n1 — Chini ya Ksh 20,000\n2 — Ksh 20,000 – 100,000\n3 — Ksh 100,000 – 500,000\n4 — Ksh 500,000 – 1M\n5 — Juu ya 1M",
    },
    options: [
      { value: "<20k", label_en: "Below Ksh 20,000", label_sw: "Chini ya Ksh 20,000" },
      { value: "20k-100k", label_en: "Ksh 20,000 – 100,000", label_sw: "Ksh 20,000 – 100,000" },
      { value: "100k-500k", label_en: "Ksh 100,000 – 500,000", label_sw: "Ksh 100,000 – 500,000" },
      { value: "500k-1M", label_en: "Ksh 500,000 – 1M", label_sw: "Ksh 500,000 – 1M" },
      { value: ">1M", label_en: "Above 1M", label_sw: "Juu ya 1M" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 5) return { valid: true, value: ["<20k", "20k-100k", "100k-500k", "500k-1M", ">1M"][n - 1] };
      return { valid: false, error: "Reply 1–5" };
    },
  },
  {
    key: "loanAmountRequested",
    type: "number",
    label: {
      en: "How much funding do you want? (in Ksh, e.g. 200000)",
      sw: "Unataka pesa kiasi gani? (kwa Ksh, mfano 200000)",
    },
    placeholder: "e.g. 200000 (Ksh 200,000)",
    validate: (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 500 || n > 50000000) return { valid: false, error: "Enter amount between 500 and 50M" };
      return { valid: true };
    },
  },
  {
    key: "businessPlanDescription",
    type: "text",
    optional: true,
    label: {
      en: "Briefly describe what your business does and how you'll use the funds. (Optional — type SKIP)",
      sw: "Eleze ufupi ufupi biashara yako inafanya nini na utatumia fedha vipi. (Si lazima — andika SKIP)",
    },
    placeholder: "Short description, or SKIP",
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      return { valid: true };
    },
  },
];

const GROUP_FIELDS = [
  {
    key: "groupName",
    type: "text",
    label: {
      en: "What is your group/self-help group name?",
      sw: "Jina la kikundi chako ni nini?",
    },
    validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "Group name too short" }),
  },
  {
    key: "groupRegNo",
    type: "text",
    label: {
      en: "Group registration number (from Dept. of Social Services)?",
      sw: "Nambari ya usajili wa kikundi (kutoka Kifaru cha Huduma za Jamii)?",
    },
    placeholder: "e.g. CS/12345/2020",
    validate: (v) => (v.trim().length >= 5 ? { valid: true } : { valid: false, error: "Enter registration number" }),
  },
  {
    key: "groupMembersCount",
    type: "number",
    label: {
      en: "How many members are in your group?",
      sw: "Kuna washiriki wangapi katika kikundi chako?",
    },
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 10 && n <= 500) return { valid: true };
      return { valid: false, error: "Most funds require min 10 members" };
    },
  },
];

const EDUCATION_FIELDS = [
  {
    key: "studentName",
    type: "text",
    label: {
      en: "What is the student's full name?",
      sw: "Jina kamili la mwanafunzi ni nini?",
    },
    validate: (v) => (v.trim().length >= 4 ? { valid: true } : { valid: false, error: "Enter at least 2 names" }),
  },
  {
    key: "studentIdNumber",
    type: "text",
    label: {
      en: "Student's National ID / Birth Certificate number?",
      sw: "Kitambulisho cha mwanafunzi / nambari ya cheti cha kuzaliwa?",
    },
    validate: (v) => (v.trim().length >= 5 ? { valid: true } : { valid: false, error: "Enter ID or birth cert number" }),
  },
  {
    key: "institutionName",
    type: "text",
    label: {
      en: "Name of your school / college / university?",
      sw: "Jina la shule / kolleti / chuo kikuu?",
    },
    validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "School name too short" }),
  },
  {
    key: "courseLevel",
    type: "select",
    label: {
      en: "Which level?\n1 — Secondary (Form 1–4)\n2 — College / Diploma\n3 — University (Degree)\n4 — TVET / Polytechnic",
      sw: "Ni kiwango gani?\n1 — Sekondari (Fomu 1–4)\n2 — Koleti / Diploma\n3 — Chuo Kikuu (Shahada)\n4 — TVET / Politekniki",
    },
    options: [
      { value: "secondary", label_en: "Secondary", label_sw: "Sekondari" },
      { value: "college", label_en: "College / Diploma", label_sw: "Koleti / Diploma" },
      { value: "university", label_en: "University", label_sw: "Chuo Kikuu" },
      { value: "tvet", label_en: "TVET / Polytechnic", label_sw: "TVET / Politekniki" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 4) return { valid: true, value: ["secondary", "college", "university", "tvet"][n - 1] };
      return { valid: false, error: "Reply 1–4" };
    },
  },
  {
    key: "admissionNumber",
    type: "text",
    label: {
      en: "Student's admission number?",
      sw: "Nambari ya kuandikishwa ya mwanafunzi?",
    },
    validate: (v) => (v.trim().length >= 2 ? { valid: true } : { valid: false, error: "Enter admission number" }),
  },
  {
    key: "feesBalance",
    type: "number",
    label: {
      en: "Approximate school fees balance per term/year? (in Ksh)",
      sw: "Sala ya karo ya shule kwa mwezi/mwaka ni kiasi gani? (kwa Ksh)",
    },
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 500 && n <= 500000) return { valid: true };
      return { valid: false, error: "Enter amount between 500 and 500,000" };
    },
  },
  {
    key: "parentGuardianName",
    type: "text",
    label: {
      en: "Parent/guardian full name?",
      sw: "Jina kamili la mzazi/malazi?",
    },
    validate: (v) => (v.trim().length >= 4 ? { valid: true } : { valid: false, error: "Enter at least 2 names" }),
  },
  {
    key: "parentGuardianId",
    type: "text",
    label: {
      en: "Parent/guardian ID number?",
      sw: "Nambari ya kitambulisho cha mzazi/malazi?",
    },
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length >= 7) return { valid: true };
      return { valid: false, error: "Enter valid ID number" };
    },
  },
];

const BANKING_FIELDS = [
  {
    key: "bankName",
    type: "select",
    label: {
      en: "Which bank do you use?\n1 — Equity\n2 — KCB\n3 — Cooperative\n4 — Absa\n5 — Standard Chartered\n6 — NCBA\n7 — Other\n8 — No bank (M-Pesa only)",
      sw: "Unatumia benki gani?\n1 — Equity\n2 — KCB\n3 — Cooperative\n4 — Absa\n5 — Standard Chartered\n6 — NCBA\n7 — Nyingine\n8 — Hana benki (M-Pesa tu)",
    },
    options: [
      { value: "equity", label_en: "Equity Bank", label_sw: "Equity Bank" },
      { value: "kcb", label_en: "KCB", label_sw: "KCB" },
      { value: "coop", label_en: "Cooperative Bank", label_sw: "Cooperative Bank" },
      { value: "absa", label_en: "Absa", label_sw: "Absa" },
      { value: "stanchart", label_en: "Standard Chartered", label_sw: "Standard Chartered" },
      { value: "ncba", label_en: "NCBA", label_sw: "NCBA" },
      { value: "other", label_en: "Other", label_sw: "Nyingine" },
      { value: "mpesa_only", label_en: "M-Pesa only", label_sw: "M-Pesa tu" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 8) return { valid: true, value: ["equity", "kcb", "coop", "absa", "stanchart", "ncba", "other", "mpesa_only"][n - 1] };
      return { valid: false, error: "Reply 1–8" };
    },
  },
  {
    key: "bankAccountNumber",
    type: "text",
    optional: true,
    label: {
      en: "Bank account number? (Optional — type SKIP if M-Pesa only)",
      sw: "Nambari ya akaunti ya benki? (Si lazima — andika SKIP)",
    },
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      if (v.trim().length >= 4) return { valid: true };
      return { valid: false, error: "Account number too short" };
    },
  },
  {
    key: "mpesaNumber",
    type: "phone",
    label: {
      en: "M-Pesa registered number?",
      sw: "Nambari ya simu iliyosajiliwa kwa M-Pesa?",
    },
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      if (digits.length >= 9) return { valid: true };
      return { valid: false, error: "Enter valid M-Pesa number" };
    },
  },
];

const DISABILITY_FIELDS = [
  {
    key: "disabilityType",
    type: "select",
    label: {
      en: "Type of disability?\n1 — Physical / Mobility\n2 — Visual impairment\n3 — Hearing impairment\n4 — Intellectual\n5 — Mental health\n6 — Other / Multiple",
      sw: "Aina ya ulemavu?\n1 — Mwili / Mwenendo\n2 — Uonekanaji\n3 — Usikiaji\n4 — Akili\n5 — Afya ya akili\n6 — Nyingine / Nyingi",
    },
    options: [
      { value: "physical", label_en: "Physical", label_sw: "Mwili" },
      { value: "visual", label_en: "Visual", label_sw: "Uonekanaji" },
      { value: "hearing", label_en: "Hearing", label_sw: "Usikiaji" },
      { value: "intellectual", label_en: "Intellectual", label_sw: "Akili" },
      { value: "mental", label_en: "Mental health", label_sw: "Afya ya akili" },
      { value: "other", label_en: "Other / Multiple", label_sw: "Nyingine / Nyingi" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 6) return { valid: true, value: ["physical", "visual", "hearing", "intellectual", "mental", "other"][n - 1] };
      return { valid: false, error: "Reply 1–6" };
    },
  },
  {
    key: "ncpwdCertNumber",
    type: "text",
    optional: true,
    label: {
      en: "NCPWD disability certificate number? (Optional — apply at ncpwd.go.ke if you don't have one)",
      sw: "Nambari ya cheti cha ulemavu cha NCPWD? (Si lazima — omba ncpwd.go.ki kama huna)",
    },
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      return { valid: true };
    },
  },
  {
    key: "assistiveDeviceNeeded",
    type: "select",
    label: {
      en: "What support do you need?\n1 — Mobility aid (wheelchair, crutches)\n2 — Hearing aid\n3 — Visual aid (white cane, glasses)\n4 — Business grant\n5 — Other support",
      sw: "Unahitaji msaada wa aina gani?\n1 — Msaada wa mwili (kiti, vikosi)\n2 — Vifaa vya kusikia\n3 — Vifaa vya kuona (kijiti, miwani)\n4 — Ruzuku ya biashara\n5 — Msaada mwingine",
    },
    options: [
      { value: "mobility", label_en: "Mobility aid", label_sw: "Msaada wa mwili" },
      { value: "hearing_aid", label_en: "Hearing aid", label_sw: "Vifaa vya kusikia" },
      { value: "visual_aid", label_en: "Visual aid", label_sw: "Vifaa vya kuona" },
      { value: "grant", label_en: "Business grant", label_sw: "Ruzuku ya biashara" },
      { value: "other", label_en: "Other", label_sw: "Nyingine" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 5) return { valid: true, value: ["mobility", "hearing_aid", "visual_aid", "grant", "other"][n - 1] };
      return { valid: false, error: "Reply 1–5" };
    },
  },
];

const LEGAL_FIELDS = [
  {
    key: "legalIssueType",
    type: "select",
    label: {
      en: "Type of legal issue?\n1 — Family / Divorce / Child custody\n2 — Land / Property dispute\n3 — Employment / Unfair dismissal\n4 — Criminal matter\n5 — Debt / Contract dispute\n6 — Other",
      sw: "Aina ya tatizo la kisheria?\n1 — Familia / Talaka / Utunzaji watoto\n2 — Ardhi / Mali\n3 — Ajira / Kufutwa kazi kikatani\n4 — Jinai\n5 — Deni / Mkataba\n6 — Nyingine",
    },
    options: [
      { value: "family", label_en: "Family", label_sw: "Familia" },
      { value: "land", label_en: "Land / Property", label_sw: "Ardhi / Mali" },
      { value: "employment", label_en: "Employment", label_sw: "Ajira" },
      { value: "criminal", label_en: "Criminal", label_sw: "Jinai" },
      { value: "debt", label_en: "Debt / Contract", label_sw: "Deni / Mkataba" },
      { value: "other", label_en: "Other", label_sw: "Nyingine" },
    ],
    validate: (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 6) return { valid: true, value: ["family", "land", "employment", "criminal", "debt", "other"][n - 1] };
      return { valid: false, error: "Reply 1–6" };
    },
  },
  {
    key: "legalCaseSummary",
    type: "text",
    label: {
      en: "Briefly describe your legal situation (1–3 sentences). This will help match you to the right lawyer.",
      sw: "Eleze ufupi ufupi hali yako ya kisheria. Hii itakusaidia kupata mwerezi sahihi.",
    },
    validate: (v) => (v.trim().length >= 10 ? { valid: true } : { valid: false, error: "Please enter at least 10 characters" }),
  },
  {
    key: "courtOrStation",
    type: "text",
    optional: true,
    label: {
      en: "If already in court — which court or police station? (Optional — SKIP if not)",
      sw: "Kwa kuwa tayari kwenye korti — ni korti gani au kituo cha polisi? (Si lazima — SKIP)",
    },
    validate: (v) => {
      if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
      return { valid: true };
    },
  },
];

const BENEFIT_FORM_MAP = {
  _templates: {
    "loans-personal": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS.slice(0, 1),
      ...BUSINESS_FIELDS,
      ...BANKING_FIELDS,
    ],
    "loans-group": [
      ...PERSONAL_BASIC.slice(0, 3),
      ...LOCATION_FIELDS,
      ...GROUP_FIELDS,
      ...BUSINESS_FIELDS,
      ...BANKING_FIELDS,
    ],
    "education-bursary": [
      ...PERSONAL_BASIC.slice(0, 1),
      ...EDUCATION_FIELDS,
      ...LOCATION_FIELDS.slice(0, 1),
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "health-disability": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS,
      ...DISABILITY_FIELDS,
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "health-general": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS.slice(0, 1),
      {
        key: "dependantsCount",
        type: "number",
        label: {
          en: "How many dependants will you register (including yourself)?",
          sw: "Utasajili watoto/ watu wangapi unaowategemea (pamoja na wewe mwenyewe)?",
        },
        validate: (v) => {
          const n = parseInt(v, 10);
          return n >= 1 && n <= 20 ? { valid: true } : { valid: false, error: "Enter 1–20" };
        },
      },
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "employment-training": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS,
      {
        key: "kcseGrade",
        type: "text",
        optional: true,
        label: {
          en: "KCSE grade? (Optional — SKIP if not applicable)",
          sw: "Daraja la KCSE? (Si lazima — SKIP)",
        },
        validate: (v) => {
          if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
          return { valid: true };
        },
      },
      {
        key: "preferredSector",
        type: "select",
        label: {
          en: "Preferred training sector?\n1 — ICT / Tech\n2 — Construction\n3 — Hospitality\n4 — Agriculture\n5 — Automotive / Mechanics\n6 — Beauty & Cosmetology\n7 — Business & Entrepreneurship",
          sw: "Sekta ya mafunzo unayopendelea?\n1 — ICT / Teknolojia\n2 — Ujenzi\n3 — Ushirikina\n4 — Kilimo\n5 — Magari / Mechaniki\n6 — Urembo\n7 — Biashara",
        },
        options: [
          { value: "ict", label_en: "ICT/Tech", label_sw: "ICT/Teknolojia" },
          { value: "construction", label_en: "Construction", label_sw: "Ujenzi" },
          { value: "hospitality", label_en: "Hospitality", label_sw: "Ushirikina" },
          { value: "agriculture", label_en: "Agriculture", label_sw: "Kilimo" },
          { value: "automotive", label_en: "Automotive", label_sw: "Magari" },
          { value: "beauty", label_en: "Beauty", label_sw: "Urembo" },
          { value: "business", label_en: "Business", label_sw: "Biashara" },
        ],
        validate: (v) => {
          const n = parseInt(v, 10);
          if (n >= 1 && n <= 7) return { valid: true, value: ["ict", "construction", "hospitality", "agriculture", "automotive", "beauty", "business"][n - 1] };
          return { valid: false, error: "Reply 1–7" };
        },
      },
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "legal-aid": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS,
      ...LEGAL_FIELDS,
    ],
    "housing-boma": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS,
      {
        key: "preferredCounty",
        type: "text",
        label: {
          en: "Which county would you prefer housing in?",
          sw: "Ungependelea nyumba katika kaunti gani?",
        },
        validate: (v) => (v.trim().length >= 3 ? { valid: true } : { valid: false, error: "County name too short" }),
      },
      {
        key: "unitType",
        type: "select",
        label: {
          en: "Preferred unit type?\n1 — Bedsitter (1 room)\n2 — 1 bedroom\n3 — 2 bedroom\n4 — 3+ bedroom / Standalone house",
          sw: "Aina ya nyumba unayopendelea?\n1 — Chumba kimoja tu (Bedsitter)\n2 — 1 bedroom\n3 — 2 bedroom\n4 — 3+ bedroom / Nyumba kubwa",
        },
        options: [
          { value: "bedsitter", label_en: "Bedsitter", label_sw: "Bedsitter" },
          { value: "1br", label_en: "1 bedroom", label_sw: "1 bedroom" },
          { value: "2br", label_en: "2 bedroom", label_sw: "2 bedroom" },
          { value: "3br+", label_en: "3+ bedroom", label_sw: "3+ bedroom" },
        ],
        validate: (v) => {
          const n = parseInt(v, 10);
          if (n >= 1 && n <= 4) return { valid: true, value: ["bedsitter", "1br", "2br", "3br+"][n - 1] };
          return { valid: false, error: "Reply 1–4" };
        },
      },
      {
        key: "monthlyBudget",
        type: "number",
        label: {
          en: "How much can you afford per month for housing? (in Ksh)",
          sw: "Unauweza kumudu kiasi gani kwa mwezi kwa nyumba? (kwa Ksh)",
        },
        validate: (v) => {
          const n = parseInt(v, 10);
          return n >= 1000 && n <= 200000 ? { valid: true } : { valid: false, error: "Enter 1,000 – 200,000" };
        },
      },
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "social-cash": [
      ...PERSONAL_BASIC,
      ...LOCATION_FIELDS,
      {
        key: "householdMembers",
        type: "number",
        label: {
          en: "How many people live in your household?",
          sw: "Watu wangapi wanaishi kwenye nyumba yako?",
        },
        validate: (v) => {
          const n = parseInt(v, 10);
          return n >= 1 && n <= 30 ? { valid: true } : { valid: false, error: "Enter 1–30" };
        },
      },
      {
        key: "eligibilityCategory",
        type: "select",
        label: {
          en: "Which category applies to you?\n1 — Elderly (70+ years)\n2 — Orphan / Vulnerable child (OVC)\n3 — Person with severe disability\n4 — None (just checking)",
          sw: "Kategoria gani inakufaa wewe?\n1 — Mzee (miaka 70+)\n2 — Mwanaa yetu / Yule ambaye hajui jina la mzazi (OVC)\n3 — Mtu aliye na ulemavu mkubwa\n4 — Hakuna (ninaangalia tu)",
        },
        options: [
          { value: "elderly", label_en: "Elderly 70+", label_sw: "Mzee 70+" },
          { value: "ovc", label_en: "OVC", label_sw: "OVC" },
          { value: "severe_disability", label_en: "Severe disability", label_sw: "Ulemavu mkubwa" },
          { value: "none", label_en: "None / Checking", label_sw: "Hakuna / Ninaangalia" },
        ],
        validate: (v) => {
          const n = parseInt(v, 10);
          if (n >= 1 && n <= 4) return { valid: true, value: ["elderly", "ovc", "severe_disability", "none"][n - 1] };
          return { valid: false, error: "Reply 1–4" };
        },
      },
      ...BANKING_FIELDS.filter((f) => f.key === "mpesaNumber"),
    ],
    "instant-mobile": [
      ...PERSONAL_BASIC.slice(0, 3),
      {
        key: "loanAmountMobile",
        type: "number",
        label: {
          en: "How much do you want to borrow? (Ksh 500 – 50,000)",
          sw: "Unataka kukopa kiasi gani? (Ksh 500 – 50,000)",
        },
        validate: (v) => {
          const n = parseInt(v, 10);
          return n >= 500 && n <= 50000 ? { valid: true } : { valid: false, error: "Enter 500 – 50,000" };
        },
      },
      {
        key: "confirmTerms",
        type: "select",
        label: {
          en: "Confirm: Interest is 8%/year (0.002%/day). Repay in 14 days. Reply 1 to agree, 2 to cancel.\n\n1 — I agree, apply now\n2 — Cancel, I'll think about it",
          sw: "Thibitisha: Riba ni 8%/mwaka (0.002%/siku). Lipa kwa siku 14. Jibu 1 kukubali, 2 kugocha.\n\n1 — Nakubaliana, omba sasa\n2 — Kugocha, ntafakari juu yake",
        },
        options: [
          { value: "agree", label_en: "Agree", label_sw: "Kubaliana" },
          { value: "cancel", label_en: "Cancel", label_sw: "Kugocha" },
        ],
        validate: (v) => {
          const n = parseInt(v, 10);
          if (n === 1 || n === 2) return { valid: true, value: n === 1 ? "agree" : "cancel" };
          return { valid: false, error: "Reply 1 or 2" };
        },
      },
    ],
    "agpo-tenders": [
      ...PERSONAL_BASIC,
      ...BUSINESS_FIELDS,
      {
        key: "agpoAware",
        type: "select",
        label: {
          en: "Have you applied for AGPO certificate before?\n1 — Yes, I'm already certified\n2 — No, I need to get AGPO first",
          sw: "Umeshahi omba cheti cha AGPO awali?\n1 — Ndio, nina cheti tayari\n2 — Hapana, nahitaji kuanza kuzipata",
        },
        options: [
          { value: "certified", label_en: "Certified", label_sw: "Nina cheti" },
          { value: "not_certified", label_en: "Need AGPO first", label_sw: "Nahitaji AGPO kwanza" },
        ],
        validate: (v) => {
          const n = parseInt(v, 10);
          if (n === 1 || n === 2) return { valid: true, value: n === 1 ? "certified" : "not_certified" };
          return { valid: false, error: "Reply 1 or 2" };
        },
      },
      ...BANKING_FIELDS,
    ],
    "startup-investment": [
      ...PERSONAL_BASIC,
      ...BUSINESS_FIELDS,
      {
        key: "pitchDeckUrl",
        type: "text",
        optional: true,
        label: {
          en: "Link to pitch deck or website? (Optional — SKIP if none)",
          sw: "Kiungo cha pitch deck au tovuti? (Si lazima — SKIP)",
        },
        validate: (v) => {
          if (["skip", "ruka", "0", ""].includes(v.toLowerCase())) return { valid: true, skip: true };
          return { valid: true };
        },
      },
      {
        key: "employeesCount",
        type: "number",
        label: {
          en: "How many full-time employees do you have?",
          sw: "Unawakiliwa na wafanyakazi wangapi wa muda wote?",
        },
        validate: (v) => {
          const n = parseInt(v, 10);
          return n >= 0 && n <= 1000 ? { valid: true } : { valid: false, error: "Enter 0–1000" };
        },
      },
    ],
  },

  _defaultTemplate: "loans-personal",

  _mappings: {
    "hustler-fund-personal": "instant-mobile",
    "yedf-loan": "loans-personal",
    "uwezo-fund": "loans-group",
    "women-enterprise-fund": "loans-personal",
    "kenya-women-youth-fund": "loans-personal",
    "agpo": "agpo-tenders",
    "kiep-250": "startup-investment",
    "widu-africa": "loans-personal",
    "ward-sme-grant": "loans-personal",
    "county-youth-funds": "loans-personal",
    "equity-fanikisha": "loans-personal",
    "safaricom-spark": "startup-investment",
    "google-startups-africa": "startup-investment",
    "developpp-ventures": "startup-investment",
    "tef-grant": "loans-personal",
    "usaid-kenya-grants": "startup-investment",
    "sha-registration": "health-general",
    "disability-fund": "health-disability",
    "inua-jamii": "social-cash",
    "hsnp": "social-cash",
    "ngcdf-bursary": "education-bursary",
    "mastercard-scholars": "education-bursary",
    "google-hustle-academy": "employment-training",
    "nys-recruitment": "employment-training",
    "kyep": "employment-training",
    "ajira-digital": "employment-training",
    "kcb-2jiajiri": "employment-training",
    "lsk-legal-aid": "legal-aid",
    "judiciary-legal-aid": "legal-aid",
    "boma-yangu": "housing-boma",
  },
};

function getFormForBenefit(benefitId) {
  const templateId = BENEFIT_FORM_MAP._mappings[benefitId] || BENEFIT_FORM_MAP._defaultTemplate;
  const fields = BENEFIT_FORM_MAP._templates[templateId] || BENEFIT_FORM_MAP._templates[BENEFIT_FORM_MAP._defaultTemplate];
  return {
    templateId,
    fieldCount: fields.length,
    estimatedMinutes: Math.max(2, Math.round(fields.length * 0.4)),
    fields,
  };
}

function getFieldLabel(field, lang) {
  return lang === "sw" ? field.label.sw : field.label.en;
}

function validateField(field, rawValue, lang) {
  if (!rawValue) rawValue = "";
  const value = rawValue.trim();

  if (field.validate) {
    const result = field.validate(value);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }
    return { valid: true, value: result.value !== undefined ? result.value : value, skip: !!result.skip };
  }

  return { valid: true, value };
}

module.exports = {
  BENEFIT_FORM_MAP,
  getFormForBenefit,
  getFieldLabel,
  validateField,
  PERSONAL_BASIC,
  BUSINESS_FIELDS,
  EDUCATION_FIELDS,
  LOCATION_FIELDS,
  BANKING_FIELDS,
  GROUP_FIELDS,
  DISABILITY_FIELDS,
  LEGAL_FIELDS,
};
