/**
 * Faida Logger
 * ──────────────────────────────────────────────────────────
 * Structured logging with pino. Pretty output in development,
 * daily-rotated file logs in production. Never logs raw phone numbers.
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const pino = require("pino");
const { hashUserId } = require("./privacy");

const LOGS_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOGS_DIR, "faida.log");

/**
 * Writable stream that rotates faida.log daily in production.
 */
class DailyRotatingStream extends Writable {
  constructor() {
    super();
    this.currentDate = null;
    this.fileStream = null;
  }

  /**
   * Opens or rotates the log file for the current UTC date.
   */
  _ensureStream() {
    const today = new Date().toISOString().slice(0, 10);

    if (this.currentDate === today && this.fileStream) return;

    if (this.fileStream) {
      this.fileStream.end();
      this.fileStream = null;
    }

    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    if (this.currentDate && fs.existsSync(LOG_FILE)) {
      const archived = path.join(LOGS_DIR, `faida-${this.currentDate}.log`);
      try {
        if (!fs.existsSync(archived)) fs.renameSync(LOG_FILE, archived);
      } catch (_) {
        // If rename fails, continue appending to faida.log
      }
    }

    this.currentDate = today;
    this.fileStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
  }

  _write(chunk, encoding, callback) {
    try {
      this._ensureStream();
      this.fileStream.write(chunk, encoding, callback);
    } catch (err) {
      callback(err);
    }
  }

  _final(callback) {
    if (this.fileStream) this.fileStream.end(callback);
    else callback();
  }
}

/**
 * Creates the pino logger instance based on environment.
 */
function createLogger() {
  const isTest =
    process.env.NODE_ENV === "test" || (process.argv[1] || "").includes("test.js");
  const isProd = process.env.NODE_ENV === "production";

  if (isTest) {
    return pino({ level: "silent" });
  }

  if (isProd) {
    return pino({ level: process.env.LOG_LEVEL || "info" }, new DailyRotatingStream());
  }

  return pino({
    level: process.env.LOG_LEVEL || "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  });
}

const logger = createLogger();

/**
 * Returns a hashed user identifier safe for logs.
 */
function userHash(userId) {
  if (!userId) return "unknown";
  return hashUserId(userId).slice(0, 12);
}

/**
 * Logs an incoming user message.
 */
function logIncoming(userId, text, meta = {}) {
  logger.info(
    {
      event: "message_in",
      user: userHash(userId),
      isVoice: !!meta.isVoice,
      textLength: (text || "").length,
      preview: meta.isVoice ? "[voice]" : (text || "").slice(0, 80),
    },
    "Incoming message"
  );
}

/**
 * Logs a bot reply sent to a user.
 */
function logReply(userId, reply) {
  logger.info(
    {
      event: "message_out",
      user: userHash(userId),
      textLength: (reply || "").length,
      preview: (reply || "").slice(0, 80),
    },
    "Reply sent"
  );
}

/**
 * Logs an error with optional context.
 */
function logError(err, context = {}) {
  logger.error(
    {
      event: "error",
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      ...context,
      user: context.userId ? userHash(context.userId) : undefined,
    },
    err.message || "Error"
  );
}

/**
 * Logs session creation for a user.
 */
function logSessionCreated(userId) {
  logger.info({ event: "session_created", user: userHash(userId) }, "Session created");
}

/**
 * Logs session expiry for a user.
 */
function logSessionExpired(userId) {
  logger.info({ event: "session_expired", user: userHash(userId) }, "Session expired");
}

/**
 * Logs eligibility match results with scores.
 */
function logEligibilityMatches(userId, matches) {
  logger.info(
    {
      event: "eligibility_match",
      user: userHash(userId),
      matchCount: matches.length,
      matches: matches.map((m) => ({
        benefitId: m.benefit.id,
        benefitName: m.benefit.name,
        score: m.score,
        reasons: m.reasons,
      })),
    },
    "Eligibility matches computed"
  );
}

/**
 * Generic structured event logger (analytics-friendly).
 */
function logEvent(eventName, metadata = {}) {
  try {
    logger.info({ event: eventName, ...metadata }, `Event: ${eventName}`);
  } catch (_) {
    // Never let logging break the bot
  }
}

module.exports = {
  logger,
  userHash,
  logIncoming,
  logReply,
  logError,
  logSessionCreated,
  logSessionExpired,
  logEligibilityMatches,
  logEvent,
};
