/**
 * Faida Deadline Reminder System
 * ──────────────────────────────────────────────────────────
 * Checks benefits with upcoming deadlines daily at 8am Nairobi time
 * and sends WhatsApp reminders to opted-in users who matched those benefits.
 */

const benefits = require("../db/benefits");
const { getReminderRecipients, markReminderSent } = require("./session");
const { logger } = require("./logger");

const NAIROBI_TZ = "Africa/Nairobi";
const REMINDER_WINDOW_DAYS = 7;
const CHECK_INTERVAL_MS = 60 * 1000;

let lastRunDateKey = null;
let schedulerStarted = false;

/**
 * Returns Nairobi date/time parts for scheduling.
 */
function getNairobiDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type).value;

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/**
 * Returns a YYYY-MM-DD key for the current Nairobi date.
 */
function getNairobiDateKey(date = new Date()) {
  const p = getNairobiDateParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Parses MM-DD or YYYY-MM-DD into month and day numbers.
 */
function parseDeadlineParts(deadlineDate) {
  const segments = deadlineDate.split("-").map(Number);
  if (segments.length === 2) {
    return { month: segments[0], day: segments[1] };
  }
  if (segments.length === 3) {
    return { year: segments[0], month: segments[1], day: segments[2] };
  }
  return null;
}

/**
 * Infers a deadline from common deadline text patterns.
 */
function inferDeadlineFromText(deadlineText) {
  if (!deadlineText) return null;

  const text = deadlineText.toLowerCase();
  if (text.includes("rolling") || text.includes("24/7") || text.includes("ongoing")) {
    return null;
  }

  const nairobi = getNairobiDateParts();
  let month = null;
  let day = 31;

  if (text.includes("january") && text.includes("march")) {
    month = 3;
    day = 31;
  } else if (text.includes("august") && text.includes("october")) {
    month = 10;
    day = 31;
  } else if (text.includes("march")) {
    month = 3;
    day = 31;
  } else if (text.includes("october")) {
    month = 10;
    day = 31;
  } else {
    return null;
  }

  let year = nairobi.year;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  const today = new Date(Date.UTC(nairobi.year, nairobi.month - 1, nairobi.day));
  if (candidate < today) year += 1;

  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Resolves the next applicable deadline date for a benefit.
 */
function getNextDeadline(benefit) {
  if (benefit.deadlineDate) {
    const parsed = parseDeadlineParts(benefit.deadlineDate);

    if (benefit.deadlineAnnual && parsed && !parsed.year) {
      const nairobi = getNairobiDateParts();
      let year = nairobi.year;
      const candidate = new Date(Date.UTC(year, parsed.month - 1, parsed.day));
      const today = new Date(Date.UTC(nairobi.year, nairobi.month - 1, nairobi.day));
      if (candidate < today) year += 1;
      return new Date(Date.UTC(year, parsed.month - 1, parsed.day));
    }

    if (parsed && parsed.year) {
      return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
    }
  }

  return inferDeadlineFromText(benefit.deadline);
}

/**
 * Returns days between two dates (UTC midnight based).
 */
function daysBetween(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const from = Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
  const to = Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate());
  return Math.round((to - from) / msPerDay);
}

/**
 * Returns benefits with deadlines within the given number of days.
 */
function getUpcomingBenefits(withinDays = REMINDER_WINDOW_DAYS) {
  const nairobi = getNairobiDateParts();
  const today = new Date(Date.UTC(nairobi.year, nairobi.month - 1, nairobi.day));
  const upcoming = [];

  for (const benefit of benefits) {
    const deadline = getNextDeadline(benefit);
    if (!deadline) continue;

    const daysLeft = daysBetween(today, deadline);
    if (daysLeft >= 0 && daysLeft <= withinDays) {
      upcoming.push({ benefit, deadline, daysLeft });
    }
  }

  return upcoming;
}

/**
 * Formats a deadline reminder message for WhatsApp.
 */
function formatReminderMessage(benefit, daysLeft, lang) {
  const isSw = lang === "sw";
  const urgency =
    daysLeft === 0
      ? isSw
        ? "Leo ndio siku ya mwisho!"
        : "Today is the deadline!"
      : isSw
        ? `Siku ${daysLeft} zimesalia`
        : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;

  if (isSw) {
    return (
      `⏰ *Kumbusho la Faida*\n\n` +
      `Umekuwa umeomba kupata kumbusho kuhusu fursa ulizostahili.\n\n` +
      `*${benefit.emoji} ${benefit.name}*\n` +
      `${urgency} — ${benefit.deadline}\n\n` +
      `*Jinsi ya kuomba:*\n${benefit.howToApply.split("\n")[0]}\n\n` +
      `*Kiungo:* ${benefit.link}\n\n` +
      `Jibu *D1* kwa hatua kamili · *REMINDERS OFF* kuzima kumbusho`
    );
  }

  return (
    `⏰ *Faida Deadline Reminder*\n\n` +
    `You asked to be reminded about benefits you matched.\n\n` +
    `*${benefit.emoji} ${benefit.name}*\n` +
    `${urgency} — ${benefit.deadline}\n\n` +
    `*How to apply:*\n${benefit.howToApply.split("\n")[0]}\n\n` +
    `*Link:* ${benefit.link}\n\n` +
    `Reply *D1* for full steps · *REMINDERS OFF* to stop reminders`
  );
}

/**
 * Sends deadline reminders to all eligible opted-in users.
 */
async function runDailyReminders(sendMessageFn) {
  if (!sendMessageFn) return { sent: 0, skipped: 0 };

  const upcoming = getUpcomingBenefits();
  if (upcoming.length === 0) return { sent: 0, skipped: 0 };

  const recipients = getReminderRecipients();
  const todayKey = getNairobiDateKey();
  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    for (const { benefit, daysLeft } of upcoming) {
      if (!recipient.matchedBenefitIds.includes(benefit.id)) {
        skipped++;
        continue;
      }

      if (recipient.remindersSent[benefit.id] === todayKey) {
        skipped++;
        continue;
      }

      try {
        const message = formatReminderMessage(benefit, daysLeft, recipient.language);
        await sendMessageFn(recipient.userId, message);
        markReminderSent(recipient.userId, benefit.id, todayKey);
        sent++;
      } catch (_) {
        skipped++;
      }
    }
  }

  return { sent, skipped };
}

/**
 * Starts the daily 8am Nairobi reminder scheduler.
 */
function startReminderScheduler(sendMessageFn) {
  if (schedulerStarted) return;
  schedulerStarted = true;

  setInterval(async () => {
    const p = getNairobiDateParts();
    const todayKey = getNairobiDateKey();

    if (p.hour !== 8 || p.minute !== 0) return;
    if (lastRunDateKey === todayKey) return;

    lastRunDateKey = todayKey;
    const result = await runDailyReminders(sendMessageFn);
    logger.info({ event: "reminders_run", ...result }, "Daily reminders completed");
    console.log(`⏰ Reminders sent: ${result.sent} (skipped: ${result.skipped})`);
  }, CHECK_INTERVAL_MS);
}

module.exports = {
  getUpcomingBenefits,
  getNextDeadline,
  formatReminderMessage,
  runDailyReminders,
  startReminderScheduler,
  getNairobiDateKey,
};
