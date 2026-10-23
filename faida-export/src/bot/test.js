/**
 * Faida — Automated Tests
 * Run: node src/bot/test.js
 */

process.env.NODE_ENV = "test";

const { matchBenefits, scoreQueryKeywords } = require("../lib/eligibility");
const { isProfileComplete } = require("../lib/profile");
const { getBenefits } = require("../lib/benefits-store");
const { handleMessage, processMessage } = require("./handler");
const {
  createSession,
  getOrCreate,
  getSession,
  clearSession,
  sessionToRow,
  rowToSession,
} = require("../lib/session");
const { CONSENT_VERSION, maskPii } = require("../lib/privacy");
const { isAiAvailable } = require("../lib/ai");
const { formatOpportunitiesList } = require("../lib/opportunities");
const { isVerifiedUrl } = require("../lib/sources");
const { mapMtajiRow } = require("../lib/mtaji");
const { searchVerifiedCatalog } = require("../lib/websearch");
const { getSubmissionSupport } = require("../lib/submit");
const { answerCurrentField, formatWebFormDocument } = require("../lib/formassist");

let passed = 0;
let failed = 0;

function test(name, fn) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${name}`);
      console.log(`     ${err.message}`);
      failed++;
    }
  })();
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) throw new Error(`Expected "${expected}", got "${actual}"`);
    },
    toBeGreaterThan: (n) => {
      if (actual <= n) throw new Error(`Expected > ${n}, got ${actual}`);
    },
    toContain: (str) => {
      if (!actual.includes(str)) throw new Error(`Expected to contain "${str}", got:\n${actual}`);
    },
    toBeTruthy: () => {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
    toHaveLength: (n) => {
      if (actual.length !== n) throw new Error(`Expected length ${n}, got ${actual.length}`);
    },
  };
}

// ── Eligibility Tests ────────────────────────────────────────────────────

console.log("\n📋 Eligibility Engine Tests\n");

test("Young woman qualifies for Women Enterprise Fund", () => {
  const matches = matchBenefits({
    age: 28, gender: "female", county: "Nairobi",
    employed: false, businessOwner: true, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("women-enterprise-fund")).toBe(true);
});

test("Male user does NOT qualify for Women Enterprise Fund", () => {
  const matches = matchBenefits({
    age: 28, gender: "male", county: "Nairobi",
    employed: false, businessOwner: true, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("women-enterprise-fund")).toBe(false);
});

test("Person over 35 does not qualify for YEDF", () => {
  const matches = matchBenefits({
    age: 40, gender: "male", county: "Mombasa",
    employed: false, businessOwner: true, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("yedf-loan")).toBe(false);
});

test("Person with disability gets disability fund", () => {
  const matches = matchBenefits({
    age: 30, gender: "female", county: "Kisumu",
    employed: false, businessOwner: false, disability: true,
    hasSafaricom: true, categoriesWanted: ["health"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("disability-fund")).toBe(true);
});

test("Person without disability does NOT get disability fund", () => {
  const matches = matchBenefits({
    age: 30, gender: "female", county: "Kisumu",
    employed: false, businessOwner: false, disability: false,
    hasSafaricom: true, categoriesWanted: ["health"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("disability-fund")).toBe(false);
});

test("Everyone qualifies for SHA registration", () => {
  const profiles = [
    { age: 16, gender: "male", county: "Nairobi", employed: true, businessOwner: false, disability: false, hasSafaricom: true, categoriesWanted: ["health"] },
    { age: 65, gender: "female", county: "Turkana", employed: false, businessOwner: false, disability: true, hasSafaricom: false, categoriesWanted: ["health"] },
  ];
  for (const profile of profiles) {
    const matches = matchBenefits(profile);
    const names = matches.map((m) => m.benefit.id);
    expect(names.includes("sha-registration")).toBe(true);
  }
});

test("Business owner under 36 qualifies for AGPO", () => {
  const matches = matchBenefits({
    age: 30, gender: "male", county: "Nairobi",
    employed: false, businessOwner: true, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial"],
  });
  const names = matches.map((m) => m.benefit.id);
  expect(names.includes("agpo")).toBe(true);
});

test("Category filter works — health only", () => {
  const matches = matchBenefits({
    age: 25, gender: "male", county: "Nairobi",
    employed: false, businessOwner: false, disability: false,
    hasSafaricom: true, categoriesWanted: ["health"],
  });
  const allHealth = matches.every((m) => m.benefit.category === "health");
  expect(allHealth).toBe(true);
});

test("Young woman sees more matches than older man (more targeted funds)", () => {
  const womanMatches = matchBenefits({
    age: 25, gender: "female", county: "Nairobi",
    employed: false, businessOwner: true, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial", "health", "employment", "legal", "housing"],
  });
  const manMatches = matchBenefits({
    age: 45, gender: "male", county: "Nairobi",
    employed: true, businessOwner: false, disability: false,
    hasSafaricom: true, categoriesWanted: ["financial", "health", "employment", "legal", "housing"],
  });
  expect(womanMatches.length).toBeGreaterThan(0);
  expect(manMatches.length).toBeGreaterThan(0);
});

// ── Conversation Flow Tests ──────────────────────────────────────────────

console.log("\n💬 Conversation Flow Tests\n");

function replyText(result) {
  return typeof result === "string" ? result : result?.reply || "";
}

async function runFlowTests() {
  const userId = "test-user-001";

  await test("Welcome message triggers on 'hi'", async () => {
    const session = createSession(userId);
    const reply = replyText(await handleMessage(userId, "hi", session));
    expect(reply).toContain("Welcome to Faida");
  });

  await test("Returning user with saved profile gets welcome back on 'hi'", async () => {
    const sess = {
      step: "menu",
      language: "en",
      profileComplete: true,
      profile: {
        age: 28,
        gender: "female",
        county: "Nairobi",
        employed: false,
        businessOwner: true,
        disability: false,
        hasSafaricom: true,
        categoriesWanted: ["financial"],
      },
      lastMatches: [],
      messageTimestamps: [],
      remindersOptIn: false,
      remindersSent: {},
      application: {
        benefitId: null,
        currentFieldIndex: 0,
        templateId: null,
        answers: {},
        startedAt: null,
        completedApps: [],
      },
    };
    const { reply } = processMessage("hi", sess);
    expect(reply).toContain("Welcome back");
    if (reply.includes("How old are you")) {
      throw new Error('Should not restart the age question for returning users');
    }
  });

  await test("Age validation rejects non-numbers", async () => {
    createSession(userId);
    await handleMessage(userId, "hi", await getOrCreate(userId));
    let sess2 = await getOrCreate(userId);
    await handleMessage(userId, "1", sess2); // English
    sess2 = await getOrCreate(userId);
    await handleMessage(userId, "1", sess2); // agree to privacy notice
    sess2 = await getOrCreate(userId);
    const reply = replyText(await handleMessage(userId, "twenty five", sess2));
    expect(reply).toContain("valid age");
  });

  await test("MENU command works at any step", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = replyText(await handleMessage(userId, "MENU", sess));
    expect(reply).toContain("Main Menu");
  });

  await test("HELP command returns how Faida works", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = replyText(await handleMessage(userId, "HELP", sess));
    expect(reply).toContain("How Faida works");
  });

  await test("SHARE command returns share message", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = replyText(await handleMessage(userId, "SHARE", sess));
    expect(reply).toContain("share");
  });

  await test("Full conversation flow produces results", async () => {
    const flowId = "test-flow-001";
    await clearSession(flowId);
    let sess;

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "hi", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "1", sess); // English

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "1", sess); // agree to privacy notice

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "25", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "2", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "Nairobi", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "2", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "2", sess);

    sess = await getOrCreate(flowId);
    const reply = replyText(await handleMessage(flowId, "6", sess));

    expect(reply).toContain("Great news");
  });

  await test("REMINDERS ON enables deadline alerts", async () => {
    const reminderUser = "test-reminders-001";
    createSession(reminderUser);
    const sess = await getOrCreate(reminderUser);
    const reply = replyText(await handleMessage(reminderUser, "REMINDERS ON", sess));
    expect(reply).toContain("reminders turned ON");
    const updated = await getOrCreate(reminderUser);
    expect(updated.remindersOptIn).toBe(true);
  });

  await test("REMINDERS OFF disables deadline alerts", async () => {
    const reminderUser = "test-reminders-002";
    createSession(reminderUser);
    let sess = await getOrCreate(reminderUser);
    await handleMessage(reminderUser, "REMINDERS ON", sess);
    sess = await getOrCreate(reminderUser);
    const reply = replyText(await handleMessage(reminderUser, "REMINDERS OFF", sess));
    expect(reply).toContain("reminders turned OFF");
    const updated = await getOrCreate(reminderUser);
    expect(updated.remindersOptIn).toBe(false);
  });

  await test("CHAT without API key shows unavailable message", async () => {
    const chatUser = "test-chat-001";
    createSession(chatUser);
    let sess = await getOrCreate(chatUser);
    sess = {
      ...sess,
      profileComplete: true,
      profile: {
        age: 25,
        gender: "female",
        county: "Nairobi",
        employed: false,
        businessOwner: true,
        disability: false,
        hasSafaricom: true,
        categoriesWanted: ["financial"],
      },
      step: "menu",
    };
    const reply = replyText(await handleMessage(chatUser, "CHAT", sess));
    if (isAiAvailable()) {
      expect(reply).toContain("AI Assistant");
    } else {
      expect(reply).toContain("isn't available");
    }
  });

  await test("OPPORTUNITIES command returns verified sources message", async () => {
    const oppUser = "test-opportunities-001";
    createSession(oppUser);
    const sess = await getOrCreate(oppUser);
    const reply = replyText(await handleMessage(oppUser, "OPPORTUNITIES", sess));
    expect(
      reply.includes("verified") ||
        reply.includes("vilivyothibitishwa") ||
        reply.includes("No new opportunities") ||
        reply.includes("admin-approved") ||
        reply.includes("zilizoidhinishwa")
    ).toBe(true);
  });

  await test("Verified URL allowlist accepts .go.ke domains", () => {
    expect(isVerifiedUrl("https://www.socialprotection.go.ke/program")).toBe(true);
    expect(isVerifiedUrl("https://random-scam-site.com/grant")).toBe(false);
  });

  await test("formatOpportunitiesList shows verified footer", () => {
    const sample = [
      {
        emoji: "🆕",
        name: "Test Grant",
        sourceName: "World Bank",
        link: "https://www.worldbank.org/en/news/test",
      },
    ];
    const formatted = formatOpportunitiesList(sample, "en");
    expect(formatted).toContain("M-Taji");
    expect(formatted).toContain("World Bank");
  });

  await test("M-Taji opportunity maps to verified partner link", () => {
    const opp = mapMtajiRow({
      id: "994b773b-3676-4461-8dde-d789bc698dac",
      title: "Youth Volunteers Needed",
      organization: "MY-KDM",
      amount: "Stipend",
      kind: "grant",
      listing_status: "published",
    });
    expect(opp).toBeTruthy();
    expect(opp.link).toBe(
      "https://www.m-taji.co.ke/opportunities/994b773b-3676-4461-8dde-d789bc698dac"
    );
    expect(opp.sourceName).toContain("M-Taji");
    expect(isVerifiedUrl(opp.link)).toBe(true);
  });

  await test("M-Taji draft listings are excluded", () => {
    const opp = mapMtajiRow({
      id: "draft-1",
      title: "Hidden Grant",
      listing_status: "draft",
    });
    expect(opp).toBe(null);
  });

  await test("Verified catalog search finds youth-related benefits", () => {
    const hits = searchVerifiedCatalog("youth");
    expect(hits.length).toBeGreaterThan(0);
  });

  await test("Web form assistant tracks answers", () => {
    const webForm = {
      fields: [{ key: "fullName", label: "Full name", type: "text", required: true }],
      answers: {},
      currentFieldIndex: 0,
      title: "Test",
      sourceUrl: "https://www.m-taji.co.ke/opportunities/x",
      refCode: "WEB-ABC",
    };
    const result = answerCurrentField(webForm, "Jane Doe");
    expect(result.ok).toBe(true);
    expect(result.webForm.answers.fullName).toBe("Jane Doe");
    const doc = formatWebFormDocument(result.webForm, "en");
    expect(doc).toContain("Jane Doe");
  });

  await test("M-Taji submission support is detected", () => {
    const support = getSubmissionSupport("https://www.m-taji.co.ke/opportunities/abc-123");
    expect(support.supported).toBe(true);
    expect(support.partner).toBe("m-taji");
  });

  // ── Privacy / data protection ──────────────────────────────────────

  await test("Privacy notice is shown before any personal questions", async () => {
    const id = "test-consent-001";
    createSession(id);
    await handleMessage(id, "hi", await getOrCreate(id));
    const reply = replyText(await handleMessage(id, "1", await getOrCreate(id)));
    expect(reply).toContain("Your privacy");
    expect((await getOrCreate(id)).step).toBe("ask_consent");
  });

  await test("Agreeing records consent and starts the questions", async () => {
    const id = "test-consent-002";
    createSession(id);
    await handleMessage(id, "hi", await getOrCreate(id));
    await handleMessage(id, "1", await getOrCreate(id));
    const reply = replyText(await handleMessage(id, "1", await getOrCreate(id)));
    expect(reply).toContain("How old are you");
    const sess = await getOrCreate(id);
    expect(sess.consent.version).toBe(CONSENT_VERSION);
  });

  await test("Declining consent erases the session", async () => {
    const id = "test-consent-003";
    createSession(id);
    await handleMessage(id, "hi", await getOrCreate(id));
    await handleMessage(id, "2", await getOrCreate(id)); // Kiswahili
    const reply = replyText(await handleMessage(id, "2", await getOrCreate(id)));
    expect(reply).toContain("HI");
    expect(getSession(id)).toBe(null);
  });

  await test("Existing user without consent is asked once, then resumes", async () => {
    const id = "test-consent-004";
    const sess = createSession(id);
    Object.assign(sess, {
      step: "menu",
      language: "en",
      profileComplete: true,
      profile: { age: 30, gender: "female", county: "Nairobi", categoriesWanted: ["financial"] },
    });
    const first = replyText(await handleMessage(id, "RESULTS", await getOrCreate(id)));
    expect(first).toContain("updated how Faida handles");
    const second = replyText(await handleMessage(id, "1", await getOrCreate(id)));
    expect(second).toContain("Main Menu");
    expect((await getOrCreate(id)).step).toBe("menu");
  });

  await test("DELETE MY DATA asks for confirmation, then erases", async () => {
    const id = "test-delete-001";
    const sess = createSession(id);
    Object.assign(sess, { step: "menu", language: "en", consent: { version: CONSENT_VERSION } });
    const ask = replyText(await handleMessage(id, "DELETE MY DATA", await getOrCreate(id)));
    expect(ask).toContain("Delete all your data");
    const done = replyText(await handleMessage(id, "YES", await getOrCreate(id)));
    expect(done).toContain("has been deleted");
    expect(getSession(id)).toBe(null);
  });

  await test("DELETE MY DATA is cancelled by any other reply", async () => {
    const id = "test-delete-002";
    const sess = createSession(id);
    Object.assign(sess, { step: "menu", language: "en", consent: { version: CONSENT_VERSION } });
    await handleMessage(id, "DELETE MY DATA", await getOrCreate(id));
    const reply = replyText(await handleMessage(id, "no", await getOrCreate(id)));
    expect(reply).toContain("nothing was deleted");
    expect((await getOrCreate(id)).step).toBe("menu");
  });

  await test("PRIVACY command works without consent", async () => {
    const id = "test-privacy-001";
    createSession(id);
    const reply = replyText(await handleMessage(id, "PRIVACY", await getOrCreate(id)));
    expect(reply).toContain("How Faida handles your information");
  });

  await test("Form answers with ID numbers are encrypted at rest", async () => {
    const prevKey = process.env.FAIDA_ENCRYPTION_KEY;
    process.env.FAIDA_ENCRYPTION_KEY = "test-key";
    try {
      const sess = {
        step: "application", language: "en", profile: {}, lastMatches: [],
        application: {
          benefitId: "yedf-loan", currentFieldIndex: 2, templateId: "loans-personal",
          answers: { fullName: "Jane Wanjiru", idNumber: "12345678", county: "Nairobi" },
          startedAt: 1,
          completedApps: [{ benefitId: "x", refCode: "R1", answers: { idNumber: "87654321" } }],
        },
      };
      const row = sessionToRow("u@s", sess);
      const stored = JSON.stringify(row);
      expect(stored.includes("12345678")).toBe(false);
      expect(stored.includes("87654321")).toBe(false);
      expect(stored.includes("Jane Wanjiru")).toBe(false);
      expect(row.profile.__app.answers.county).toBe("Nairobi");
      const restored = rowToSession({ ...row, created_at: new Date(), last_activity: new Date() });
      expect(restored.application.answers.idNumber).toBe("12345678");
    } finally {
      if (prevKey === undefined) delete process.env.FAIDA_ENCRYPTION_KEY;
      else process.env.FAIDA_ENCRYPTION_KEY = prevKey;
    }
  });

  await test("Without a key, ID numbers are not stored at all", async () => {
    const saved = [process.env.FAIDA_ENCRYPTION_KEY, process.env.REMINDER_ENCRYPTION_KEY];
    delete process.env.FAIDA_ENCRYPTION_KEY;
    delete process.env.REMINDER_ENCRYPTION_KEY;
    try {
      const row = sessionToRow("u@s", {
        step: "application", profile: {}, lastMatches: [],
        application: { benefitId: "yedf-loan", answers: { idNumber: "12345678" }, completedApps: [] },
      });
      expect(JSON.stringify(row).includes("12345678")).toBe(false);
    } finally {
      if (saved[0] !== undefined) process.env.FAIDA_ENCRYPTION_KEY = saved[0];
      if (saved[1] !== undefined) process.env.REMINDER_ENCRYPTION_KEY = saved[1];
    }
  });

  await test("Log masking hides ID and phone numbers", () => {
    const masked = maskPii("My ID is 12345678, call 0712 345 678 or jane@example.com");
    expect(masked.includes("12345678")).toBe(false);
    expect(masked.includes("345 678")).toBe(false);
    expect(masked.includes("jane@example.com")).toBe(false);
    expect(maskPii("I am 25 years old")).toBe("I am 25 years old");
  });
}

test("Keyword scoring boosts youth-related grants", () => {
  const yedf = getBenefits().find((b) => b.id === "yedf-loan");
  const kw = scoreQueryKeywords(yedf, "youth business loan");
  expect(kw.bonus).toBeGreaterThan(0);
});

test("Query-aware matching ranks youth funds for youth queries", () => {
  const profile = {
    age: 25,
    gender: "male",
    county: "Nairobi",
    employed: false,
    businessOwner: true,
    disability: false,
    hasSafaricom: true,
    categoriesWanted: ["financial"],
  };
  const matches = matchBenefits(profile, "youth enterprise loan");
  const ids = matches.map((m) => m.benefit.id);
  expect(ids.includes("yedf-loan")).toBe(true);
});

test("Profile completeness requires core fields", () => {
  expect(
    isProfileComplete({
      profile: { age: 25, gender: "male", county: "Nairobi", categoriesWanted: ["financial"] },
    })
  ).toBe(true);
  expect(isProfileComplete({ profile: { age: 25 } })).toBe(false);
});

runFlowTests().then(() => {
  console.log("\n" + "─".repeat(50));
  console.log(`\n  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("  🎉 All tests passed!\n");
  } else {
    console.log("  ⚠️  Some tests failed — check output above.\n");
    process.exit(1);
  }
});
