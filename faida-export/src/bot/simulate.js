/**
 * Faida Bot Simulator
 * ──────────────────────────────────────────────────────────
 * Test the full conversation flow in your terminal.
 * No WhatsApp connection needed.
 *
 * Run: node src/bot/simulate.js
 */

const readline = require("readline");
const { handleMessage } = require("./handler");
const { getOrCreate, updateSession } = require("../lib/session");

const TEST_USER = "254700000000@s.whatsapp.net";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n");
console.log("╔══════════════════════════════════════════════╗");
console.log("║     🌿  FAIDA BOT SIMULATOR                  ║");
console.log("║     Test the bot without WhatsApp            ║");
console.log("╚══════════════════════════════════════════════╝");
console.log("\nType messages as if you were a WhatsApp user.");
console.log('Type "exit" to quit.\n');
console.log("─".repeat(50));

async function chat(userInput) {
  const session = await getOrCreate(TEST_USER);
  const reply = await handleMessage(TEST_USER, userInput, session);
  console.log("\n🤖 Faida:\n");
  // Format for terminal (remove WhatsApp markdown)
  console.log(reply.replace(/\*/g, "").replace(/_/g, ""));
  console.log("\n" + "─".repeat(50));
}

function prompt() {
  rl.question("\nYou: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("\nGoodbye! 👋\n");
      rl.close();
      return;
    }
    await chat(input);
    prompt();
  });
}

// Start with a greeting
chat("hi").then(prompt);
