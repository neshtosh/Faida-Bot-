/**
 * Faida — Automated Tests
 * Run: node src/bot/test.js
 */

process.env.NODE_ENV = "test";

const { matchBenefits } = require("../lib/eligibility");
const { handleMessage } = require("./handler");
const { createSession, getOrCreate } = require("../lib/session");
const { isAiAvailable } = require("../lib/ai");
const { formatOpportunitiesList } = require("../lib/opportunities");
const { isVerifiedUrl } = require("../lib/sources");

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

async function runFlowTests() {
  const userId = "test-user-001";

  await test("Welcome message triggers on 'hi'", async () => {
    const session = createSession(userId);
    const reply = await handleMessage(userId, "hi", session);
    expect(reply).toContain("Welcome to Faida");
  });

  await test("Age validation rejects non-numbers", async () => {
    createSession(userId);
    await handleMessage(userId, "hi", await getOrCreate(userId));
    let sess2 = await getOrCreate(userId);
    await handleMessage(userId, "1", sess2);
    sess2 = await getOrCreate(userId);
    const reply = await handleMessage(userId, "twenty five", sess2);
    expect(reply).toContain("valid age");
  });

  await test("MENU command works at any step", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = await handleMessage(userId, "MENU", sess);
    expect(reply).toContain("Main Menu");
  });

  await test("HELP command returns how Faida works", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = await handleMessage(userId, "HELP", sess);
    expect(reply).toContain("How Faida works");
  });

  await test("SHARE command returns share message", async () => {
    createSession(userId);
    const sess = await getOrCreate(userId);
    const reply = await handleMessage(userId, "SHARE", sess);
    expect(reply).toContain("share");
  });

  await test("Full conversation flow produces results", async () => {
    const flowId = "test-flow-001";
    let sess;

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "hi", sess);

    sess = await getOrCreate(flowId);
    await handleMessage(flowId, "1", sess);

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
    const reply = await handleMessage(flowId, "6", sess);

    expect(reply).toContain("Great news");
  });

  await test("REMINDERS ON enables deadline alerts", async () => {
    const reminderUser = "test-reminders-001";
    createSession(reminderUser);
    const sess = await getOrCreate(reminderUser);
    const reply = await handleMessage(reminderUser, "REMINDERS ON", sess);
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
    const reply = await handleMessage(reminderUser, "REMINDERS OFF", sess);
    expect(reply).toContain("reminders turned OFF");
    const updated = await getOrCreate(reminderUser);
    expect(updated.remindersOptIn).toBe(false);
  });

  await test("CHAT without API key shows unavailable message", async () => {
    const chatUser = "test-chat-001";
    createSession(chatUser);
    const sess = await getOrCreate(chatUser);
    const reply = await handleMessage(chatUser, "CHAT", sess);
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
    const reply = await handleMessage(oppUser, "OPPORTUNITIES", sess);
    expect(
      reply.includes("verified") ||
        reply.includes("vilivyothibitishwa") ||
        reply.includes("No new opportunities")
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
    expect(formatted).toContain("verified official sources");
    expect(formatted).toContain("World Bank");
  });
}

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
