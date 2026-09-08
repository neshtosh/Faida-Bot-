/**
 * Faida WhatsApp Bot — Entry Point (Fixed QR Display)
 */

require("dotenv").config();

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");

const { handleMessage } = require("./handler");
const { getOrCreate } = require("../lib/session");
const { startReminderScheduler } = require("../lib/reminders");
const { logIncoming, logReply, logError, logger } = require("../lib/logger");
const { validateEnv } = require("../lib/env");
const { startHealthServer, setBotStatus, setCurrentQr, clearCurrentQr, getQrPageUrl, getPublicUrlSetupHint } = require("../lib/health");
const { startOpportunityScheduler } = require("../lib/opportunities");

const AUTH_FOLDER = path.join(__dirname, "../../.auth");
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

const baileyLogger = pino({ level: "silent" });
const PORT = process.env.PORT || 3000;

validateEnv();
startHealthServer(PORT);
startOpportunityScheduler();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  console.log("\n🌿 Faida Benefits Bot starting...\n");

  const sock = makeWASocket({
    version,
    logger: baileyLogger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileyLogger),
    },
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (connection === "connecting") setBotStatus("connecting");

    if (qr) {
      setBotStatus("awaiting_qr_scan");
      setCurrentQr(qr);

      console.clear();
      console.log("╔══════════════════════════════════════════════╗");
      console.log("║     🌿  FAIDA BOT — Scan to Connect          ║");
      console.log("╚══════════════════════════════════════════════╝\n");
      qrcode.generate(qr, { small: true });
      const qrLink = getQrPageUrl();
      const setupHint = getPublicUrlSetupHint();

      console.log("\n🔗 Scan from your phone:");
      if (qrLink) {
        console.log(`   ${qrLink}\n`);
      } else if (setupHint) {
        console.log(`   ⚠️  ${setupHint}\n`);
      } else {
        console.log("   (Public link unavailable — check server logs)\n");
      }
      console.log("📱 Or scan the QR above in this terminal.");
      console.log("   WhatsApp → Settings → Linked Devices → Link a Device\n");
      console.log("⏳ QR expires in ~60 seconds — page auto-refreshes with a new one.\n");
    }

    if (connection === "close") {
      setBotStatus("disconnected");
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        logger.warn({ event: "connection_close", reason }, "Reconnecting");
        console.log("🔄 Reconnecting...\n");
        setTimeout(startBot, 3000);
      } else {
        clearCurrentQr();
        logger.warn({ event: "logged_out" }, "Bot logged out");
        console.log("🚫 Logged out. Delete the .auth folder and restart.\n");
      }
    }

    if (connection === "open") {
      clearCurrentQr();
      console.clear();
      console.log("╔══════════════════════════════════════════════╗");
      console.log("║     ✅  FAIDA BOT IS LIVE!                   ║");
      console.log("║     Waiting for messages...                  ║");
      console.log("╚══════════════════════════════════════════════╝\n");

      startReminderScheduler(async (userId, text) => {
        await sock.sendMessage(userId, { text });
        logReply(userId, text);
      });

      logger.info({ event: "bot_live" }, "Faida bot connected to WhatsApp");
      setBotStatus("connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (msg.key.remoteJid.endsWith("@g.us")) continue;
      if (!msg.message) continue;

      const isVoice = !!(msg.message.audioMessage || msg.message.pttMessage);

      const messageContent =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!messageContent.trim() && !isVoice) continue;

      const userId = msg.key.remoteJid;
      const senderName = msg.pushName || "Friend";

      logIncoming(userId, messageContent, { isVoice });
      console.log(`📨 ${senderName}: "${isVoice ? "[voice message]" : messageContent}"`);

      try {
        const session = await getOrCreate(userId);
        const reply = await handleMessage(userId, messageContent, session, { isVoice });
        if (!reply) continue;
        await sock.sendMessage(userId, { text: reply });
        logReply(userId, reply);
        console.log(`✅ Replied\n`);
      } catch (err) {
        logError(err, { userId, event: "message_handler" });
        console.error(`❌ Error:`, err.message);
        try {
          await sock.sendMessage(userId, {
            text: "Sorry, something went wrong. 😔 Type *MENU* to start fresh.",
          });
        } catch (_) {}
      }
    }
  });
}

startBot().catch((err) => {
  logError(err, { event: "fatal" });
  console.error("Fatal error:", err);
  process.exit(1);
});