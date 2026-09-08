/**
 * Faida Office Locator
 * ──────────────────────────────────────────────────────────
 * Maps benefits and counties to nearest application offices.
 * Used by the NEAREST command in the conversation handler.
 */

const COUNTY_OFFICES = {
  Nairobi: {
    name: "Huduma Centre — Nairobi (GPO)",
    address: "Teleposta Towers, Kenyatta Avenue, Nairobi CBD",
    hours: "Mon–Fri 8am–5pm",
    phone: "020 222 0000",
  },
  Mombasa: {
    name: "Huduma Centre — Mombasa",
    address: "Mombasa Trade Centre, Nkurumah Road, Mombasa",
    hours: "Mon–Fri 8am–5pm",
    phone: "041 222 0000",
  },
  Kisumu: {
    name: "Huduma Centre — Kisumu",
    address: "Kisumu County Government Building, Oginga Odinga Street",
    hours: "Mon–Fri 8am–5pm",
    phone: "057 222 0000",
  },
  Nakuru: {
    name: "Huduma Centre — Nakuru",
    address: "County Headquarters, Kenyatta Avenue, Nakuru",
    hours: "Mon–Fri 8am–5pm",
    phone: "051 222 0000",
  },
  default: {
    name: "Nearest Huduma Centre",
    address: "Visit your county Huduma Centre or Sub-County office",
    hours: "Mon–Fri 8am–5pm",
    phone: "Call 101 (Huduma Kenya helpline)",
  },
};

const BENEFIT_OFFICES = {
  "hustler-fund-personal": {
    name: "Hustler Fund — Safaricom USSD",
    address: "Apply from anywhere: dial *254# on Safaricom",
    hours: "Available 24/7",
    phone: "No office visit needed",
  },
  "yedf-loan": {
    name: "Youth Enterprise Development Fund Office",
    address: "Sub-County Youth Development Office in your area",
    hours: "Mon–Fri 8am–4pm",
    phone: "Visit yedf.go.ke for contacts",
  },
  "ngcdf-bursary": {
    name: "NG-CDF Constituency Office",
    address: "Your MP's constituency NG-CDF office",
    hours: "Mon–Fri 8am–4pm",
    phone: "Visit ngcdf.go.ke to find your office",
  },
  "inua-jamii": {
    name: "Sub-County Social Development Office",
    address: "Ministry of Labour — Sub-County Social Development Office",
    hours: "Mon–Fri 8am–4pm",
    phone: "Visit labour.go.ke/inua-jamii",
  },
  "ajira-digital": {
    name: "Ajira Digital Centre",
    address: "Nearest Ajira Digital centre — visit ajiradigital.go.ke/centres",
    hours: "Mon–Sat 8am–5pm",
    phone: "Visit ajiradigital.go.ke",
  },
};

/**
 * Finds the nearest application office for a benefit and location.
 */
function findNearestOffice(benefitId, county, locationText) {
  const benefitOffice = BENEFIT_OFFICES[benefitId];
  const countyKey = normalizeCounty(county);
  const countyOffice = COUNTY_OFFICES[countyKey] || COUNTY_OFFICES.default;

  const office = benefitOffice || countyOffice;
  const location = locationText || county || "your area";

  return { office, location, county: countyKey || county || "Kenya" };
}

/**
 * Normalizes county name for lookup.
 */
function normalizeCounty(county) {
  if (!county || county === "Unknown") return null;
  const normalized = county.trim();
  const keys = Object.keys(COUNTY_OFFICES).filter((k) => k !== "default");
  const match = keys.find((k) => k.toLowerCase() === normalized.toLowerCase());
  return match || normalized;
}

/**
 * Formats office details into a WhatsApp message.
 */
function formatOfficeMessage(result, benefitName, lang) {
  const { office, location } = result;
  const isSw = lang === "sw";

  if (isSw) {
    return (
      `📍 *Ofisi Iliyo Karibu — ${benefitName}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*Eneo lako:* ${location}\n\n` +
      `*Ofisi:* ${office.name}\n` +
      `*Anwani:* ${office.address}\n` +
      `*Saa:* ${office.hours}\n` +
      `*Simu:* ${office.phone}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Jibu *D1* kwa hatua kamili za kuomba · *MENU* kwa chaguo zaidi`
    );
  }

  return (
    `📍 *Nearest Office — ${benefitName}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*Your location:* ${location}\n\n` +
    `*Office:* ${office.name}\n` +
    `*Address:* ${office.address}\n` +
    `*Hours:* ${office.hours}\n` +
    `*Phone:* ${office.phone}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Reply *D1* for full application steps · *MENU* for more options`
  );
}

module.exports = { findNearestOffice, formatOfficeMessage, normalizeCounty };
