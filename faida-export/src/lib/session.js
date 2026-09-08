/**
 * Faida Session Manager
 * ──────────────────────────────────────────────────────────
 * Tracks each user's conversation state in memory with optional Supabase
 * persistence. Falls back to in-memory-only when Supabase is unavailable.
 *
 * Session shape:
 * {
 *   step: string,
 *   language: "en" | "sw" | null,
 *   profile: {},
 *   lastMatches: [],
 *   feedback: {},
 *   messageTimestamps: [],
 *   createdAt: number,
 *   lastActivity: number,
 *   isNew: boolean,
 *   remindersOptIn: boolean,
 *   remindersSent: {},
 *   application: {
 *     benefitId: string | null,
 *     currentFieldIndex: number,
 *     templateId: string | null,
 *     answers: {},
 *     startedAt: number | null,
 *     completedApps: [{benefitId, answers, completedAt, refCode}],
 *   },
 * }
 */

require("dotenv").config();

const benefits = require("../db/benefits");
const { hashUserId } = require("./privacy");
const { getSupabaseClient } = require("./supabase");
const { logSessionCreated, logSessionExpired } = require("./logger");

const sessions = new Map();
const pendingLoads = new Map();

const SESSION_TTL_MS = 30 * 60 * 1000;

const memoryAnalytics = {
  totalUsers: 0,
  totalMatchesServed: 0,
  benefitCounts: {},
};

/**
 * Returns a default session object for a new user.
 */
function buildDefaultSession() {
  const now = Date.now();
  return {
    step: "welcome",
    language: null,
    profile: {},
    lastMatches: [],
    feedback: null,
    messageTimestamps: [],
    createdAt: now,
    lastActivity: now,
    isNew: true,
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
}

/**
 * Serializes benefit matches for database storage.
 */
function serializeMatches(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.map((m) => ({
    benefitId: m.benefit.id,
    score: m.score,
    reasons: m.reasons || [],
  }));
}

/**
 * Rehydrates stored matches back into full benefit objects.
 */
function deserializeMatches(stored) {
  if (!Array.isArray(stored)) return [];

  return stored
    .map((item) => {
      const benefit = benefits.find((b) => b.id === item.benefitId);
      if (!benefit) return null;
      return {
        benefit,
        score: item.score || 0,
        reasons: item.reasons || [],
      };
    })
    .filter(Boolean);
}

/**
 * Converts a database row into an in-memory session object.
 */
function rowToSession(row) {
  const p = row.profile || {};
  return {
    step: row.step || "welcome",
    language: row.language || null,
    profile: typeof p === "object" && !Array.isArray(p) && !p.__app ? p : {},
    lastMatches: deserializeMatches(row.last_matches),
    feedback: row.feedback || null,
    messageTimestamps: row.message_timestamps || [],
    createdAt: new Date(row.created_at).getTime(),
    lastActivity: new Date(row.last_activity).getTime(),
    isNew: false,
    remindersOptIn: row.reminders_opt_in || false,
    remindersSent: row.reminders_sent || {},
    application:
      typeof p === "object" && p && p.__app
        ? {
            benefitId: p.__app.benefitId || null,
            currentFieldIndex: p.__app.currentFieldIndex || 0,
            templateId: p.__app.templateId || null,
            answers: p.__app.answers || {},
            startedAt: p.__app.startedAt || null,
            completedApps: p.__app.completedApps || [],
          }
        : {
            benefitId: null,
            currentFieldIndex: 0,
            templateId: null,
            answers: {},
            startedAt: null,
            completedApps: [],
          },
  };
}

/**
 * Converts a session object into a database row payload.
 */
function sessionToRow(userId, session) {
  const rawProfile = session.profile || {};
  const hasApp =
    session.application &&
    (session.application.benefitId ||
      (session.application.completedApps && session.application.completedApps.length > 0));
  const profilePayload = hasApp
    ? { ...rawProfile, __app: session.application }
    : rawProfile;
  return {
    user_id_hash: hashUserId(userId),
    step: session.step,
    language: session.language,
    profile: profilePayload,
    last_matches: serializeMatches(session.lastMatches),
    feedback: session.feedback,
    message_timestamps: session.messageTimestamps || [],
    reminders_opt_in: !!session.remindersOptIn,
    reminders_sent: session.remindersSent || {},
    created_at: new Date(session.createdAt || Date.now()).toISOString(),
    last_activity: new Date(session.lastActivity || Date.now()).toISOString(),
  };
}

/**
 * Loads a session from Supabase by hashed user ID.
 */
async function loadSessionFromSupabase(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id_hash", hashUserId(userId))
      .maybeSingle();

    if (error || !data) return null;

    const session = rowToSession(data);
    if (Date.now() - session.lastActivity > SESSION_TTL_MS) return null;

    return session;
  } catch (_) {
    return null;
  }
}

/**
 * Persists a session to Supabase in the background.
 */
async function persistSession(userId, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const row = sessionToRow(userId, session);
    const { error } = await supabase.from("sessions").upsert(row, {
      onConflict: "user_id_hash",
    });
    return !error;
  } catch (_) {
    return false;
  }
}

/**
 * Records an analytics event in Supabase and in-memory counters.
 */
async function recordAnalyticsEvent(eventType, userId, benefitId, metadata) {
  updateMemoryAnalytics(eventType, benefitId);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      user_id_hash: userId ? hashUserId(userId) : null,
      benefit_id: benefitId || null,
      metadata: metadata || {},
    });
  } catch (_) {
    // Analytics failures should never break the bot
  }
}

/**
 * Updates in-memory analytics counters.
 */
function updateMemoryAnalytics(eventType, benefitId) {
  if (eventType === "user_created") {
    memoryAnalytics.totalUsers += 1;
  }

  if (eventType === "matches_served") {
    memoryAnalytics.totalMatchesServed += 1;
  }

  if (eventType === "benefit_matched" && benefitId) {
    memoryAnalytics.benefitCounts[benefitId] =
      (memoryAnalytics.benefitCounts[benefitId] || 0) + 1;
  }
}

/**
 * Tracks analytics based on session updates.
 */
function trackAnalyticsFromUpdates(userId, updates, previousSession) {
  if (updates.lastMatches && updates.lastMatches.length > 0) {
    const prevIds = (previousSession.lastMatches || [])
      .map((m) => m.benefit.id)
      .join(",");
    const nextIds = updates.lastMatches.map((m) => m.benefit.id).join(",");

    if (prevIds !== nextIds) {
      recordAnalyticsEvent("matches_served", userId, null, {
        matchCount: updates.lastMatches.length,
      });

      for (const match of updates.lastMatches) {
        recordAnalyticsEvent("benefit_matched", userId, match.benefit.id, {
          score: match.score,
        });
      }
    }
  }
}

/**
 * Gets a session from memory if it exists and is not expired.
 */
function getSession(userId) {
  const session = sessions.get(userId);
  if (!session) return null;

  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    logSessionExpired(userId);
    sessions.delete(userId);
    return null;
  }

  session.lastActivity = Date.now();
  return session;
}

/**
 * Creates a new in-memory session and tracks the new user.
 */
function createSession(userId) {
  const session = buildDefaultSession();
  sessions.set(userId, session);
  logSessionCreated(userId);
  recordAnalyticsEvent("user_created", userId);
  persistSession(userId, session).catch(() => {});
  return session;
}

/**
 * Updates a session in memory and persists changes asynchronously.
 */
function updateSession(userId, updates) {
  let session = getSession(userId) || sessions.get(userId);
  const previousSession = session
    ? { ...session, lastMatches: [...(session.lastMatches || [])] }
    : buildDefaultSession();

  if (!session) {
    session = buildDefaultSession();
    sessions.set(userId, session);
    recordAnalyticsEvent("user_created", userId);
  }

  Object.assign(session, updates);
  session.lastActivity = Date.now();
  session.isNew = false;
  sessions.set(userId, session);

  trackAnalyticsFromUpdates(userId, updates, previousSession);
  persistSession(userId, session).catch(() => {});

  return session;
}

/**
 * Deletes a session from memory and optionally from Supabase.
 */
async function clearSession(userId) {
  sessions.delete(userId);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("sessions").delete().eq("user_id_hash", hashUserId(userId));
  } catch (_) {
    // Ignore cleanup failures
  }
}

/**
 * Gets an existing session or creates/loads one.
 */
async function getOrCreate(userId) {
  const existing = getSession(userId);
  if (existing) return existing;

  if (pendingLoads.has(userId)) {
    return pendingLoads.get(userId);
  }

  const loadPromise = (async () => {
    const remote = await loadSessionFromSupabase(userId);
    if (remote) {
      sessions.set(userId, remote);
      return remote;
    }

    if (sessions.has(userId)) return sessions.get(userId);
    return createSession(userId);
  })();

  pendingLoads.set(userId, loadPromise);

  try {
    return await loadPromise;
  } finally {
    pendingLoads.delete(userId);
  }
}

/**
 * Returns the most popular benefit ID from a counts map.
 */
function getMostPopularBenefit(counts) {
  let topId = null;
  let topCount = 0;

  for (const [benefitId, count] of Object.entries(counts)) {
    if (count > topCount) {
      topId = benefitId;
      topCount = count;
    }
  }

  if (!topId) return null;

  const benefit = benefits.find((b) => b.id === topId);
  return {
    id: topId,
    name: benefit ? benefit.name : topId,
    count: topCount,
  };
}

/**
 * Builds analytics from in-memory counters.
 */
function getInMemoryAnalytics() {
  return {
    totalUsers: memoryAnalytics.totalUsers,
    totalMatchesServed: memoryAnalytics.totalMatchesServed,
    mostPopularBenefit: getMostPopularBenefit(memoryAnalytics.benefitCounts),
    source: "memory",
  };
}

/**
 * Returns current platform analytics from Supabase or in-memory fallback.
 */
async function getAnalytics() {
  const supabase = getSupabaseClient();
  if (!supabase) return getInMemoryAnalytics();

  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true });

    const { data: matchEvents, error: matchesError } = await supabase
      .from("analytics_events")
      .select("benefit_id")
      .eq("event_type", "benefit_matched");

    const { count: totalMatchesServed, error: servedError } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "matches_served");

    if (usersError || matchesError || servedError) {
      return getInMemoryAnalytics();
    }

    const benefitCounts = {};
    for (const event of matchEvents || []) {
      if (!event.benefit_id) continue;
      benefitCounts[event.benefit_id] = (benefitCounts[event.benefit_id] || 0) + 1;
    }

    return {
      totalUsers: totalUsers || 0,
      totalMatchesServed: totalMatchesServed || 0,
      mostPopularBenefit: getMostPopularBenefit(benefitCounts),
      source: "supabase",
    };
  } catch (_) {
    return getInMemoryAnalytics();
  }
}

/**
 * Returns opted-in users eligible for deadline reminders.
 */
function getReminderRecipients() {
  const recipients = [];

  for (const [userId, session] of sessions.entries()) {
    if (!session.remindersOptIn) continue;
    if (!session.lastMatches || session.lastMatches.length === 0) continue;

    recipients.push({
      userId,
      language: session.language || "en",
      matchedBenefitIds: session.lastMatches.map((m) => m.benefit.id),
      remindersSent: session.remindersSent || {},
    });
  }

  return recipients;
}

/**
 * Records that a reminder was sent for a benefit today.
 */
function markReminderSent(userId, benefitId, dateKey) {
  const session = sessions.get(userId);
  if (!session) return;

  if (!session.remindersSent) session.remindersSent = {};
  session.remindersSent[benefitId] = dateKey || getNairobiDateKeyFallback();
  session.lastActivity = Date.now();
  sessions.set(userId, session);
  persistSession(userId, session).catch(() => {});
}

/**
 * Returns today's date key without importing reminders (avoids circular deps).
 */
function getNairobiDateKeyFallback() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Ensures the users table has a row for this hashed user ID.
 * Upserts with first_seen / last_seen bookkeeping and optional profile snapshot.
 */
async function ensureUserRecord(userId, profileSnapshot) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const hash = hashUserId(userId);
  try {
    await supabase.rpc("faida_upsert_user", {
      p_user_id_hash: hash,
      p_language: null,
      p_profile_snapshot: profileSnapshot || {},
    });
    return true;
  } catch (_) {
    try {
      const { data: existing } = await supabase
        .from("users")
        .select("user_id_hash")
        .eq("user_id_hash", hash)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("users")
          .update({
            last_seen_at: new Date().toISOString(),
            ...(profileSnapshot && Object.keys(profileSnapshot).length > 0
              ? { profile_snapshot: profileSnapshot }
              : {}),
          })
          .eq("user_id_hash", hash);
      } else {
        await supabase.from("users").insert({
          user_id_hash: hash,
          profile_snapshot: profileSnapshot || {},
        });
      }
      return true;
    } catch (_e) {
      return false;
    }
  }
}

/**
 * Builds an "answers summary" — a PII-free / reduced version of the form
 * answers suitable for dashboard previews. Keeps category fields but
 * truncates long text.
 */
function buildAnswersSummary(answers) {
  if (!answers) return {};
  const safe = {};
  const PII_KEYS = [
    "fullName", "idNumber", "phoneNumber", "email", "parentGuardianId",
    "studentIdNumber", "kraPin", "bankAccountNumber", "mpesaNumber",
    "ncpwdCertNumber", "businessRegNo", "groupRegNo",
  ];
  for (const [k, v] of Object.entries(answers)) {
    if (v == null) continue;
    if (PII_KEYS.includes(k)) {
      safe[k] = "[redacted]";
    } else if (typeof v === "string" && v.length > 80) {
      safe[k] = v.slice(0, 77) + "...";
    } else {
      safe[k] = v;
    }
  }
  return safe;
}

/**
 * Persists a completed application to the applications + application_fields
 * tables in Supabase. Safe to call even when Supabase is unavailable (will
 * silently no-op). Returns true on success.
 */
async function persistCompletedApplication(params) {
  const {
    userId,
    benefitId,
    templateId,
    refCode,
    startedAt,
    answers,
    templateFields,
    submissionMode,
    profileSnapshot,
  } = params;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  await ensureUserRecord(userId, profileSnapshot || {});

  try {
    const userHash = hashUserId(userId);
    const startedAtISO = startedAt ? new Date(startedAt).toISOString() : new Date().toISOString();

    const { data: appRow, error: appError } = await supabase
      .from("applications")
      .insert({
        user_id_hash: userHash,
        benefit_id: benefitId,
        template_id: templateId || null,
        reference_code: refCode,
        status: "submitted",
        started_at: startedAtISO,
        submission_mode: submissionMode || null,
        answers_summary: buildAnswersSummary(answers),
        metadata: {
          fieldCount: templateFields ? templateFields.length : 0,
          answeredCount: answers ? Object.keys(answers).length : 0,
        },
      })
      .select("id")
      .single();

    if (appError || !appRow) return false;
    const applicationId = appRow.id;

    if (templateFields && templateFields.length > 0 && answers) {
      const rows = [];
      templateFields.forEach((field, idx) => {
        const key = field.key;
        if (!Object.prototype.hasOwnProperty.call(answers, key)) return;
        const raw = answers[key];
        if (raw == null) return;
        const isNumeric = field.type === "number" && !isNaN(Number(raw));
        rows.push({
          application_id: applicationId,
          field_name: key,
          field_label: field.label?.en || key,
          field_type: field.type || "text",
          value_text: isNumeric ? null : String(raw),
          value_number: isNumeric ? Number(raw) : null,
          field_index: idx,
        });
      });
      if (rows.length > 0) {
        await supabase.from("application_fields").insert(rows);
      }
    }

    try {
      await supabase.from("users").update({ app_count: supabase.rpc("inc") }).eq("user_id_hash", userHash);
    } catch (_) {
      try {
        const { data: u } = await supabase.from("users").select("app_count").eq("user_id_hash", userHash).maybeSingle();
        if (u) {
          await supabase
            .from("users")
            .update({ app_count: (u.app_count || 0) + 1 })
            .eq("user_id_hash", userHash);
        }
      } catch (_e) {}
    }

    recordAnalyticsEvent("application_complete", userId, benefitId, { refCode, templateId });

    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  getSession,
  createSession,
  updateSession,
  clearSession,
  getOrCreate,
  getAnalytics,
  getReminderRecipients,
  markReminderSent,
  serializeMatches,
  deserializeMatches,
  ensureUserRecord,
  persistCompletedApplication,
  recordAnalyticsEvent,
};
