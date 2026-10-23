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

const { getBenefits } = require("./benefits-store");
const { isProfileComplete } = require("./profile");
const {
  hashUserId,
  encryptUserId,
  decryptUserId,
  isReminderEncryptionConfigured,
  encryptJson,
  decryptJson,
  maskPii,
  PII_FIELD_KEYS,
} = require("./privacy");
const { getSupabaseClient, isSupabaseConfigured } = require("./supabase");
const { logSessionCreated, logSessionExpired } = require("./logger");

const RESERVED_PROFILE_KEYS = ["__app", "__meta"];

const sessions = new Map();
const pendingLoads = new Map();
// Per-user chain of Supabase writes, so writes land in order and a data
// deletion can wait for in-flight writes instead of racing them.
const persistChains = new Map();

const SESSION_TTL_MS = 30 * 60 * 1000;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Splits form answers for storage: identity / financial fields are
 * encrypted into `__enc`, or dropped when no encryption key is set.
 */
function protectAnswers(answers) {
  const plain = {};
  const secret = {};
  for (const [key, value] of Object.entries(answers || {})) {
    if (key === "__enc") continue;
    (PII_FIELD_KEYS.includes(key) ? secret : plain)[key] = value;
  }
  if (Object.keys(secret).length === 0) return plain;
  const enc = encryptJson(secret);
  return enc ? { ...plain, __enc: enc } : plain;
}

/**
 * Reverses protectAnswers. Rows written before encryption existed may hold
 * plaintext; those values are kept and get encrypted on the next save.
 */
function revealAnswers(stored) {
  if (!stored || typeof stored !== "object") return {};
  const { __enc, ...plain } = stored;
  const secret = __enc ? decryptJson(__enc) : null;
  return { ...plain, ...(secret || {}) };
}

/** Application state as stored: PII protected, finished apps keep no answers. */
function applicationForStorage(app) {
  return {
    ...app,
    answers: protectAnswers(app.answers),
    completedApps: (app.completedApps || []).map(({ answers, ...rest }) => rest),
  };
}

/** Web form state as stored: answers encrypted as one blob (or dropped). */
function webFormForStorage(webForm) {
  const { answers, ...rest } = webForm;
  const answersEnc = encryptJson(answers || {});
  return answersEnc ? { ...rest, answersEnc } : { ...rest, answers: {} };
}

function webFormFromStorage(stored) {
  if (!stored) return null;
  const { answersEnc, ...rest } = stored;
  return { ...rest, answers: (answersEnc ? decryptJson(answersEnc) : stored.answers) || {} };
}

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
    profileComplete: false,
    aiHistory: [],
    webForm: null,
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
      const benefit = getBenefits().find((b) => b.id === item.benefitId);
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
 * Strips internal session keys from a stored profile object.
 */
function cleanProfileFields(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return {};
  const out = { ...profile };
  for (const key of RESERVED_PROFILE_KEYS) delete out[key];
  return out;
}

/**
 * Converts a database row into an in-memory session object.
 */
function rowToSession(row) {
  const p = row.profile && typeof row.profile === "object" ? row.profile : {};
  const profile = cleanProfileFields(p);
  const meta = p.__meta && typeof p.__meta === "object" ? p.__meta : {};
  const sessionShape = {
    step: row.step || "welcome",
    language: row.language || null,
    profile,
    lastMatches: deserializeMatches(row.last_matches),
    feedback: row.feedback || null,
    messageTimestamps: row.message_timestamps || [],
    createdAt: new Date(row.created_at).getTime(),
    lastActivity: new Date(row.last_activity).getTime(),
    isNew: false,
    remindersOptIn: row.reminders_opt_in || false,
    remindersSent: row.reminders_sent || {},
    profileComplete: !!meta.profileComplete,
    consent: meta.consent || null,
    aiHistory: Array.isArray(meta.aiHistory) ? meta.aiHistory : [],
    webForm: webFormFromStorage(meta.webForm),
    application:
      p.__app && typeof p.__app === "object"
        ? {
            benefitId: p.__app.benefitId || null,
            currentFieldIndex: p.__app.currentFieldIndex || 0,
            templateId: p.__app.templateId || null,
            answers: revealAnswers(p.__app.answers),
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
  if (!sessionShape.profileComplete && isProfileComplete(sessionShape)) {
    sessionShape.profileComplete = true;
  }
  return sessionShape;
}

/**
 * Converts a session object into a database row payload.
 */
function sessionToRow(userId, session) {
  const rawProfile = cleanProfileFields(session.profile || {});
  const __meta = {
    profileComplete: !!session.profileComplete || isProfileComplete(session),
  };
  if (session.consent) __meta.consent = session.consent;
  if (session.aiHistory && session.aiHistory.length > 0) {
    // Users sometimes type ID / phone numbers into chat — don't keep them
    __meta.aiHistory = session.aiHistory
      .slice(-20)
      .map((m) => ({ ...m, content: maskPii(m.content) }));
  }
  if (session.webForm) __meta.webForm = webFormForStorage(session.webForm);

  const hasApp =
    session.application &&
    (session.application.benefitId ||
      (session.application.completedApps && session.application.completedApps.length > 0));
  const profilePayload = hasApp
    ? { ...rawProfile, __meta, __app: applicationForStorage(session.application) }
    : { ...rawProfile, __meta };
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

    return rowToSession(data);
  } catch (_) {
    return null;
  }
}

/**
 * Persists a session to Supabase in the background. Writes for the same
 * user are queued so they land in order.
 */
function persistSession(userId, session) {
  if (!getSupabaseClient()) return Promise.resolve(false);

  const previous = persistChains.get(userId) || Promise.resolve();
  const next = previous.then(() => writeSession(userId, session));
  persistChains.set(userId, next);
  next.then(() => {
    if (persistChains.get(userId) === next) persistChains.delete(userId);
  });
  return next;
}

/**
 * Erases everything stored about a user: the users row (which cascades to
 * sessions, applications and application_fields; analytics events keep no
 * link to the user) and the in-memory session. Returns false on DB error.
 */
async function deleteUserData(userId) {
  sessions.delete(userId);
  await (persistChains.get(userId) || Promise.resolve());

  const supabase = getSupabaseClient();
  if (!supabase) return true;

  const hash = hashUserId(userId);
  try {
    const { error: sessionError } = await supabase.from("sessions").delete().eq("user_id_hash", hash);
    const { error: userError } = await supabase.from("users").delete().eq("user_id_hash", hash);
    return !sessionError && !userError;
  } catch (_) {
    return false;
  }
}

async function writeSession(userId, session) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    await ensureUserRecord(userId, session);
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
 * Drops idle sessions from memory so form answers don't linger there.
 * Only when Supabase holds the durable copy — without it, memory is the
 * only store and reminders depend on it.
 */
function sweepIdleSessions() {
  if (!isSupabaseConfigured()) return 0;
  const cutoff = Date.now() - SESSION_TTL_MS;
  let evicted = 0;
  for (const [userId, session] of sessions.entries()) {
    if (session.lastActivity < cutoff && !persistChains.has(userId)) {
      sessions.delete(userId);
      evicted++;
    }
  }
  return evicted;
}

setInterval(sweepIdleSessions, SWEEP_INTERVAL_MS).unref();

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

  if (process.env.NODE_ENV === "test") {
    if (sessions.has(userId)) {
      const s = sessions.get(userId);
      s.lastActivity = Date.now();
      return s;
    }
    return createSession(userId);
  }

  if (pendingLoads.has(userId)) {
    return pendingLoads.get(userId);
  }

  const loadPromise = (async () => {
    const remote = await loadSessionFromSupabase(userId);
    if (remote) {
      const expired = Date.now() - remote.lastActivity > SESSION_TTL_MS;
      if (expired) {
        logSessionExpired(userId);
        await mergeLongTermUserMemory(userId, remote);
        remote.lastActivity = Date.now();
        if (isProfileComplete(remote)) {
          remote.step = "menu";
        }
      }
      sessions.set(userId, remote);
      return remote;
    }

    const fromUserRow = await loadUserMemoryFromSupabase(userId);
    if (fromUserRow) {
      const session = buildDefaultSession();
      applyUserMemoryToSession(session, fromUserRow);
      session.isNew = false;
      sessions.set(userId, session);
      persistSession(userId, session).catch(() => {});
      return session;
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

  const benefit = getBenefits().find((b) => b.id === topId);
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
 * Stores (opt-in) or deletes (opt-out) the encrypted WhatsApp ID used to
 * send reminders after a restart. No-op without Supabase or an encryption key.
 */
async function syncReminderContact(userId, optIn) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const encrypted = optIn ? encryptUserId(userId) : null;
  if (optIn && !encrypted) return false;

  try {
    await ensureUserRecord(userId, sessions.get(userId) || {});
    const { error } = await supabase
      .from("users")
      .update({ reminder_opt_in: !!optIn, reminder_jid_enc: encrypted })
      .eq("user_id_hash", hashUserId(userId));
    return !error;
  } catch (_) {
    return false;
  }
}

/**
 * Returns opted-in users eligible for deadline reminders: everyone in memory,
 * plus users stored in Supabase with an encrypted contact (survives restarts).
 */
async function getReminderRecipients() {
  const recipients = [];
  const seenHashes = new Set();

  for (const [userId, session] of sessions.entries()) {
    seenHashes.add(hashUserId(userId));
    if (!session.remindersOptIn) continue;
    if (!session.lastMatches || session.lastMatches.length === 0) continue;

    recipients.push({
      userId,
      language: session.language || "en",
      matchedBenefitIds: session.lastMatches.map((m) => m.benefit.id),
      remindersSent: session.remindersSent || {},
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isReminderEncryptionConfigured()) return recipients;

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id_hash, reminder_jid_enc")
      .eq("reminder_opt_in", true)
      .not("reminder_jid_enc", "is", null);
    if (error || !users?.length) return recipients;

    const stored = users.filter((u) => !seenHashes.has(u.user_id_hash));
    if (stored.length === 0) return recipients;

    const { data: rows } = await supabase
      .from("sessions")
      .select("user_id_hash, language, last_matches, reminders_sent")
      .in("user_id_hash", stored.map((u) => u.user_id_hash));
    const sessionByHash = new Map((rows || []).map((r) => [r.user_id_hash, r]));

    for (const u of stored) {
      const row = sessionByHash.get(u.user_id_hash);
      const userId = decryptUserId(u.reminder_jid_enc);
      const matchedBenefitIds = (row?.last_matches || []).map((m) => m.benefitId).filter(Boolean);
      if (!userId || matchedBenefitIds.length === 0) continue;

      recipients.push({
        userId,
        language: row.language || "en",
        matchedBenefitIds,
        remindersSent: row.reminders_sent || {},
      });
    }
  } catch (_) {
    // Fall back to in-memory recipients only
  }

  return recipients;
}

/**
 * Records that a reminder was sent for a benefit today.
 */
async function markReminderSent(userId, benefitId, dateKey) {
  const key = dateKey || getNairobiDateKeyFallback();
  const session = sessions.get(userId);

  if (session) {
    if (!session.remindersSent) session.remindersSent = {};
    session.remindersSent[benefitId] = key;
    persistSession(userId, session).catch(() => {});
    return;
  }

  // Not in memory (recipient loaded from Supabase) — update the stored row
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const hash = hashUserId(userId);
    const { data } = await supabase
      .from("sessions")
      .select("reminders_sent")
      .eq("user_id_hash", hash)
      .maybeSingle();
    await supabase
      .from("sessions")
      .update({ reminders_sent: { ...(data?.reminders_sent || {}), [benefitId]: key } })
      .eq("user_id_hash", hash);
  } catch (_) {}
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
 * Loads long-term profile memory from the users table (survives session TTL).
 */
async function loadUserMemoryFromSupabase(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("language, reminder_opt_in, profile_snapshot")
      .eq("user_id_hash", hashUserId(userId))
      .maybeSingle();

    if (error || !data) return null;

    const snap =
      data.profile_snapshot && typeof data.profile_snapshot === "object"
        ? data.profile_snapshot
        : {};
    const profile = cleanProfileFields(snap);
    const meta = snap.__meta && typeof snap.__meta === "object" ? snap.__meta : {};
    const profileComplete =
      !!meta.profileComplete ||
      isProfileComplete({ profile, profileComplete: meta.profileComplete });

    const consent = meta.consent || null;
    if (!profileComplete && !consent && Object.keys(profile).length === 0) return null;

    return {
      language: data.language || null,
      remindersOptIn: !!data.reminder_opt_in,
      profile,
      profileComplete,
      consent,
    };
  } catch (_) {
    return null;
  }
}

/**
 * Applies users-table memory onto an existing session (e.g. after TTL expiry).
 */
function applyUserMemoryToSession(session, memory) {
  if (!memory) return session;
  if (memory.language) session.language = memory.language;
  if (memory.consent && !session.consent) session.consent = memory.consent;
  if (memory.remindersOptIn) session.remindersOptIn = memory.remindersOptIn;
  if (memory.profile && Object.keys(memory.profile).length > 0) {
    session.profile = { ...session.profile, ...memory.profile };
  }
  if (memory.profileComplete || isProfileComplete(session)) {
    session.profileComplete = true;
    session.step = "menu";
  }
  return session;
}

async function mergeLongTermUserMemory(userId, session) {
  const memory = await loadUserMemoryFromSupabase(userId);
  if (memory) applyUserMemoryToSession(session, memory);
  return session;
}

/**
 * Profile fields stored on users.profile_snapshot (no active app state).
 */
function profileSnapshotForUsersTable(session) {
  const profile = cleanProfileFields(session?.profile || {});
  const consent = session?.consent || null;
  if (Object.keys(profile).length === 0) return consent ? { __meta: { consent } } : {};
  const complete = !!session?.profileComplete || isProfileComplete(session || {});
  const __meta = {
    ...(complete ? { profileComplete: true } : {}),
    ...(consent ? { consent } : {}),
  };
  return Object.keys(__meta).length > 0 ? { ...profile, __meta } : profile;
}

/**
 * Ensures the users table has a row for this hashed user ID.
 * Upserts with first_seen / last_seen bookkeeping and optional profile snapshot.
 */
async function ensureUserRecord(userId, sessionOrProfile) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const session =
    sessionOrProfile &&
    typeof sessionOrProfile === "object" &&
    ("profile" in sessionOrProfile || "profileComplete" in sessionOrProfile)
      ? sessionOrProfile
      : { profile: sessionOrProfile || {} };

  const profileSnapshot = profileSnapshotForUsersTable(session);
  const hash = hashUserId(userId);
  try {
      const { data: existing } = await supabase
        .from("users")
        .select("user_id_hash")
        .eq("user_id_hash", hash)
        .maybeSingle();
      const rowPatch = {
        last_seen_at: new Date().toISOString(),
        ...(session.language ? { language: session.language } : {}),
        reminder_opt_in: !!session.remindersOptIn,
        ...(Object.keys(profileSnapshot).length > 0
          ? { profile_snapshot: profileSnapshot }
          : {}),
      };
      if (existing) {
        await supabase.from("users").update(rowPatch).eq("user_id_hash", hash);
      } else {
        await supabase.from("users").insert({
          user_id_hash: hash,
          profile_snapshot: profileSnapshot,
          language: session.language || null,
          reminder_opt_in: !!session.remindersOptIn,
        });
      }
      return true;
  } catch (_e) {
    return false;
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
  for (const [k, v] of Object.entries(answers)) {
    if (v == null) continue;
    if (PII_FIELD_KEYS.includes(k)) {
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

  await ensureUserRecord(userId, { profile: profileSnapshot || {}, profileComplete: true });

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
        // Data minimisation: the dashboard never needs raw ID / bank / phone values
        const redacted = PII_FIELD_KEYS.includes(key);
        const isNumeric = !redacted && field.type === "number" && !isNaN(Number(raw));
        rows.push({
          application_id: applicationId,
          field_name: key,
          field_label: field.label?.en || key,
          field_type: field.type || "text",
          value_text: redacted ? "[redacted]" : isNumeric ? null : String(raw),
          value_number: isNumeric ? Number(raw) : null,
          field_index: idx,
        });
      });
      if (rows.length > 0) {
        await supabase.from("application_fields").insert(rows);
      }
    }

    try {
      const { data: u } = await supabase.from("users").select("app_count").eq("user_id_hash", userHash).maybeSingle();
      if (u) {
        await supabase
          .from("users")
          .update({ app_count: (u.app_count || 0) + 1 })
          .eq("user_id_hash", userHash);
      }
    } catch (_e) {}

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
  deleteUserData,
  sweepIdleSessions,
  sessionToRow,
  rowToSession,
  getOrCreate,
  getAnalytics,
  getReminderRecipients,
  markReminderSent,
  syncReminderContact,
  serializeMatches,
  deserializeMatches,
  ensureUserRecord,
  loadUserMemoryFromSupabase,
  applyUserMemoryToSession,
  persistCompletedApplication,
  recordAnalyticsEvent,
  cleanProfileFields,
};
