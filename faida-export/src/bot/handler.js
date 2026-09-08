/**
 * Faida Bot — Conversation Handler
 * ──────────────────────────────────────────────────────────
 * Handles all incoming messages and returns response strings.
 * Pure logic via processMessage(); handleMessage applies session updates.
 */

const { matchBenefits } = require("../lib/eligibility");
const { updateSession, persistCompletedApplication, recordAnalyticsEvent } = require("../lib/session");
const { getMessages } = require("../lib/messages");
const { findNearestOffice, formatOfficeMessage } = require("../lib/offices");
const { logEligibilityMatches, logEvent, logError } = require("../lib/logger");
const {
  getFormForBenefit,
  getFieldLabel,
  validateField,
} = require("../lib/applications");
const {
  generateReferenceCode,
  formatApplicationDocument,
} = require("../lib/documents");
const benefits = require("../db/benefits");
const { isAiAvailable, chatWithFaida } = require("../lib/ai");
const {
  getLiveOpportunities,
  formatOpportunitiesList,
  refreshOpportunities,
} = require("../lib/opportunities");

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const CATEGORY_MAP = {
  "1": "financial",
  "2": "health",
  "3": "employment",
  "4": "legal",
  "5": "housing",
};

const CATEGORY_KEYWORDS = {
  financial: "financial",
  finance: "financial",
  grant: "financial",
  loan: "financial",
  money: "financial",
  pesa: "financial",
  fedha: "financial",
  health: "health",
  medical: "health",
  hospital: "health",
  afya: "health",
  employment: "employment",
  job: "employment",
  work: "employment",
  kazi: "employment",
  training: "employment",
  legal: "legal",
  lawyer: "legal",
  court: "legal",
  kisheria: "legal",
  housing: "housing",
  house: "housing",
  nyumba: "housing",
};

const START_TRIGGERS = ["start", "restart", "hi", "hello", "habari", "hii", "hey", "sasa", "mambo"];
const MENU_TRIGGERS = ["menu", "main menu", "back", "menyu"];
const HELP_TRIGGERS = ["help", "how does this work", "what is faida", "msaada"];
const SHARE_TRIGGERS = ["share", "shiriki"];
const RESULTS_TRIGGERS = ["results", "matokeo"];
const FEEDBACK_TRIGGERS = ["feedback", "maoni", "kadiria"];
const NEAREST_TRIGGERS = ["nearest", "office", "ofisi"];
const REMINDERS_ON_TRIGGERS = ["reminders on", "reminder on", "kumbusho on"];
const REMINDERS_OFF_TRIGGERS = ["reminders off", "reminder off", "kumbusho off"];
const CHAT_TRIGGERS = ["chat", "ask", "ai", "uliza", "msaidizi"];
const OPPORTUNITIES_TRIGGERS = ["opportunities", "fursa", "latest", "new grants"];
const REFRESH_TRIGGERS = ["refresh", "update", "sasisha"];
const IDK_TRIGGERS = ["0", "i don't know", "i dont know", "idk", "don't know", "dont know", "sijui", "unknown"];

const APPLY_CANCEL_TRIGGERS = ["cancel", "stop", "sitisha", "cha", "acha"];
const APPLY_BACK_TRIGGERS = ["back", "rudi", "prev", "previous", "karibu"];

/**
 * Main entry — processes message and applies session updates.
 * Also fires non-blocking Supabase side-effects (analytics, application
 * persistence) when session transitions are detected.
 */
async function handleMessage(userId, text, session, meta = {}) {
  const input = (text || "").trim().toLowerCase();
  const msgs = () => getMessages(session.language);

  // ── AI chat mode (async — handled before sync processMessage) ──
  if (session.step === "ai_chat") {
    if (MENU_TRIGGERS.includes(input) || ["exit", "quit", "stop", "toka"].includes(input)) {
      updateSession(userId, { step: "menu" });
      return msgs().menu();
    }
    if (!isAiAvailable()) {
      return msgs().aiUnavailable();
    }
    try {
      const { reply, history } = await chatWithFaida(session, text.trim());
      updateSession(userId, { step: "ai_chat", aiHistory: history });
      return reply;
    } catch (err) {
      logError(err, { userId, event: "ai_chat" });
      return msgs().aiError();
    }
  }

  if (CHAT_TRIGGERS.includes(input)) {
    if (!isAiAvailable()) return msgs().aiUnavailable();
    updateSession(userId, { step: "ai_chat", aiHistory: [] });
    return msgs().aiWelcome();
  }

  if (OPPORTUNITIES_TRIGGERS.includes(input)) {
    try {
      const opps = await getLiveOpportunities(false);
      return formatOpportunitiesList(opps, session.language);
    } catch (err) {
      logError(err, { userId, event: "opportunities_list" });
      return msgs().aiError();
    }
  }

  if (REFRESH_TRIGGERS.includes(input)) {
    try {
      const result = await refreshOpportunities();
      return msgs().opportunitiesRefreshed(result.count);
    } catch (err) {
      logError(err, { userId, event: "opportunities_refresh" });
      return msgs().aiError();
    }
  }

  const { reply, updates } = processMessage(text, session, meta);
  if (updates) {
    updateSession(userId, updates);
    if (updates.lastMatches && updates.lastMatches.length > 0) {
      const prevIds = (session.lastMatches || []).map((m) => m.benefit.id).join(",");
      const nextIds = updates.lastMatches.map((m) => m.benefit.id).join(",");
      if (prevIds !== nextIds) {
        logEligibilityMatches(userId, updates.lastMatches);
      }
    }

    const prevActive = session?.application?.benefitId;
    const prevStep = session?.step;
    const nextStep = updates?.step;
    const nextActive = updates?.application?.benefitId;
    const nextStartedAt = updates?.application?.startedAt;

    if (
      nextStep === "application" &&
      nextActive &&
      (!prevActive || prevActive !== nextActive || prevStep !== "application") &&
      nextStartedAt &&
      Date.now() - nextStartedAt < 120_000
    ) {
      recordAnalyticsEvent(
        "application_started",
        userId,
        nextActive,
        { templateId: updates.application.templateId || null }
      ).catch(() => {});
    }

    const prevCompleted = session?.application?.completedApps?.length || 0;
    const nextCompleted = updates?.application?.completedApps?.length || 0;
    if (prevActive && !nextActive && nextCompleted > prevCompleted) {
      const newest = (updates.application.completedApps || []).slice(prevCompleted)[0];
      if (newest) {
        const form = getFormForBenefit(newest.benefitId);
        const isMobileOnly = ["hustler-fund-personal", "sha-registration"].includes(newest.benefitId);
        persistCompletedApplication({
          userId,
          benefitId: newest.benefitId,
          templateId: newest.templateId || form.templateId,
          refCode: newest.refCode,
          startedAt: session?.application?.startedAt || newest.completedAt,
          answers: newest.answers || {},
          templateFields: form.fields,
          submissionMode: isMobileOnly ? "mobile" : "office",
          profileSnapshot: session?.profile || {},
        }).catch(() => {});
      }
    }
  }
  return reply;
}

/**
 * Pure message processor — returns reply and session updates without side effects.
 */
function processMessage(text, session, meta = {}) {
  if (meta.isVoice) {
    const msgs = getMessages(session.language);
    const rateCheck = checkRateLimit(session);
    return { reply: msgs.voiceMessage(), updates: rateCheck.updates };
  }

  const rateCheck = checkRateLimit(session);
  if (rateCheck.limited) {
    const msgs = getMessages(session.language);
    return { reply: msgs.rateLimited(), updates: rateCheck.updates };
  }

  const baseUpdates = rateCheck.updates;
  let workingSession = { ...session, ...baseUpdates };
  const input = (text || "").trim().toLowerCase();
  const msgs = () => getMessages(workingSession.language);

  // ── In-application escape: BACK / CANCEL must run BEFORE global MENU
  if (workingSession.step === "application") {
    if (APPLY_CANCEL_TRIGGERS.includes(input)) {
      return cancelApplication(workingSession, baseUpdates);
    }
    if (APPLY_BACK_TRIGGERS.includes(input)) {
      return backApplicationField(workingSession, baseUpdates);
    }
  }

  // ── Global commands ─────────────────────────────────────
  if (MENU_TRIGGERS.includes(input)) {
    return { reply: msgs().menu(), updates: { ...baseUpdates, step: "menu" } };
  }

  if (HELP_TRIGGERS.includes(input)) {
    return { reply: msgs().help(), updates: baseUpdates };
  }

  if (SHARE_TRIGGERS.includes(input)) {
    return { reply: msgs().shareMessage(), updates: baseUpdates };
  }

  if (RESULTS_TRIGGERS.includes(input)) {
    return handleResults(workingSession, baseUpdates);
  }

  if (FEEDBACK_TRIGGERS.includes(input)) {
    return {
      reply: msgs().feedbackPrompt(),
      updates: { ...baseUpdates, step: "feedback_rating" },
    };
  }

  if (NEAREST_TRIGGERS.includes(input)) {
    return handleNearestCommand(workingSession, null, baseUpdates);
  }

  if (REMINDERS_ON_TRIGGERS.includes(input)) {
    return {
      reply: msgs().remindersOn(),
      updates: { ...baseUpdates, remindersOptIn: true },
    };
  }

  if (REMINDERS_OFF_TRIGGERS.includes(input)) {
    return {
      reply: msgs().remindersOff(),
      updates: { ...baseUpdates, remindersOptIn: false },
    };
  }

  // ── Application flow global commands ────────────────────────
  if (input.startsWith("apply")) {
    return handleApplyCommand(workingSession, input, baseUpdates);
  }

  if (START_TRIGGERS.includes(input)) {
    const updates = {
      ...baseUpdates,
      step: workingSession.language ? "ask_age" : "ask_language",
      profile: {},
      lastMatches: [],
    };
    const reply = workingSession.language ? msgs().welcome() : getMessages("en").askLanguage();
    return { reply, updates };
  }

  // ── Detail view: D1, D2... ──────────────────────────────
  const detailMatch = input.match(/^d(\d+)$/);
  if (detailMatch) {
    const idx = parseInt(detailMatch[1], 10) - 1;
    const matches = workingSession.lastMatches || [];
    if (idx >= 0 && idx < matches.length) {
      const benefit = matches[idx].benefit;
      const detailsMsg = formatApplicationDetails(benefit, workingSession.language);
      const actionsMsg = msgs().resultActionsMenu(benefit.name, idx + 1);
      // Store which result the action commands will operate on
      const updates = { ...baseUpdates, lastResultContext: { selectedIndex: idx } };
      return {
        reply: detailsMsg + "\n" + actionsMsg,
        updates,
      };
    }
    return {
      reply: msgs().invalidDetail(detailMatch[1]),
      updates: baseUpdates,
    };
  }

  // ── Post-results A/B/C actions ────────────────────────────
  if (workingSession.step === "results" || workingSession.step === "menu") {
    const matches = workingSession.lastMatches || [];
    const defaultIdx = matches.length > 0 ? 0 : -1;
    const ctxIdx =
      workingSession.lastResultContext?.selectedIndex !== undefined
        ? workingSession.lastResultContext.selectedIndex
        : defaultIdx;

    if (input === "a" && ctxIdx >= 0) {
      return startApplication(workingSession, matches[ctxIdx].benefit, ctxIdx, baseUpdates);
    }
    if (input === "b" && ctxIdx >= 0) {
      const benefit = matches[ctxIdx].benefit;
      return {
        reply: formatApplicationDetails(benefit, workingSession.language),
        updates: baseUpdates,
      };
    }
    if (input === "c" && ctxIdx >= 0) {
      return {
        reply: msgs().menu(),
        updates: { ...baseUpdates, step: "menu" },
      };
    }
    // Handle standalone A/B/C when user never saw D# (use #1 default)
    if ((input === "a" || input === "b" || input === "c") && matches.length > 0) {
      const benefit = matches[0].benefit;
      if (input === "a") return startApplication(workingSession, benefit, 0, baseUpdates);
      if (input === "b")
        return { reply: formatApplicationDetails(benefit, workingSession.language), updates: baseUpdates };
      if (input === "c")
        return { reply: msgs().menu(), updates: { ...baseUpdates, step: "menu" } };
    }
    if (input === "a" || input === "b" || input === "c") {
      return { reply: msgs().invalidApplyAction(), updates: baseUpdates };
    }
  }

  // ── Resume-application prompt (after CANCEL of partial) ──
  if (workingSession.step === "application_resume_prompt") {
    if (input === "1") {
      const benefit = getActiveBenefit(workingSession);
      if (!benefit) return toResults(workingSession, baseUpdates);
      return {
        reply: buildCurrentFieldQuestion(workingSession),
        updates: { ...baseUpdates, step: "application" },
      };
    }
    if (input === "2") {
      // Start fresh — reset answers, keep benefitId
      const benefit = getActiveBenefit(workingSession);
      if (!benefit) return toResults(workingSession, baseUpdates);
      const form = getFormForBenefit(benefit.id);
      const newApp = {
        benefitId: benefit.id,
        currentFieldIndex: 0,
        templateId: form.templateId,
        answers: {},
        startedAt: Date.now(),
        completedApps: workingSession.application?.completedApps || [],
      };
      return {
        reply:
          msgs().applyNowIntro(benefit.name, form.estimatedMinutes, form.fieldCount) +
          "\n\n" +
          buildCurrentFieldQuestion({
            ...workingSession,
            application: newApp,
          }),
        updates: {
          ...baseUpdates,
          step: "application",
          application: newApp,
        },
      };
    }
    if (APPLY_CANCEL_TRIGGERS.includes(input) || input === "3") {
      // Back to menu/results
      return toResults(workingSession, baseUpdates);
    }
  }

  // ── Category quick-browse from menu ───────────────────────
  const categoryFromKeyword = CATEGORY_KEYWORDS[input];
  if (categoryFromKeyword && workingSession.step === "menu") {
    return handleCategoryBrowse(workingSession, categoryFromKeyword, baseUpdates);
  }

  const step = workingSession.step;

  // ── Language selection ────────────────────────────────────
  if (step === "ask_language" || step === "welcome") {
    if (["1", "english", "en"].includes(input)) {
      return {
        reply: getMessages("en").welcome(),
        updates: { ...baseUpdates, step: "ask_age", language: "en" },
      };
    }
    if (["2", "swahili", "kiswahili", "sw"].includes(input)) {
      return {
        reply: getMessages("sw").welcome(),
        updates: { ...baseUpdates, step: "ask_age", language: "sw" },
      };
    }
    return { reply: getMessages("en").invalidLanguage(), updates: baseUpdates };
  }

  // ── Feedback flow ─────────────────────────────────────────
  if (step === "feedback_rating") {
    const rating = parseInt(input, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { reply: msgs().invalidFeedbackRating(), updates: baseUpdates };
    }
    return {
      reply: msgs().feedbackComment(),
      updates: {
        ...baseUpdates,
        step: "feedback_comment",
        feedback: { rating, comment: null, submittedAt: new Date().toISOString() },
      },
    };
  }

  if (step === "feedback_comment") {
    const comment = ["skip", "ruka", "no", "hapana"].includes(input) ? null : text.trim();
    const rating = workingSession.feedback?.rating || 0;
    return {
      reply: msgs().feedbackThanks(rating),
      updates: {
        ...baseUpdates,
        step: "menu",
        feedback: { rating, comment, submittedAt: new Date().toISOString() },
      },
    };
  }

  // ── Nearest office location step ──────────────────────────
  if (step === "nearest_location") {
    const location = isIdk(input) ? workingSession.profile?.county || "Kenya" : text.trim();
    return handleNearestWithLocation(workingSession, location, baseUpdates);
  }

  // ── Conversation flow steps ───────────────────────────────
  if (step === "ask_age") {
    if (isIdk(input)) {
      return advanceStep(workingSession, "ask_gender", { age: 30, ageUnknown: true }, msgs().askGender(), baseUpdates);
    }
    const age = parseInt(input, 10);
    if (isNaN(age) || age < 1 || age > 110) {
      return { reply: msgs().invalidAge(), updates: baseUpdates };
    }
    return advanceStep(workingSession, "ask_gender", { age }, msgs().askGender(), baseUpdates);
  }

  if (step === "ask_gender") {
    let gender;
    if (["1", "male", "m", "man", "boy", "mwanaume"].includes(input)) gender = "male";
    else if (["2", "female", "f", "woman", "girl", "mwanamke"].includes(input)) gender = "female";
    else if (isIdk(input)) gender = "unknown";
    else return { reply: msgs().invalidGender(), updates: baseUpdates };

    return advanceStep(workingSession, "ask_county", { gender }, msgs().askCounty(), baseUpdates);
  }

  if (step === "ask_county") {
    if (isIdk(input)) {
      return advanceStep(workingSession, "ask_employment", { county: "Unknown" }, msgs().askEmployment(), baseUpdates);
    }
    if (input.length < 2) {
      return { reply: msgs().invalidCounty(), updates: baseUpdates };
    }
    return advanceStep(workingSession, "ask_employment", { county: text.trim() }, msgs().askEmployment(), baseUpdates);
  }

  if (step === "ask_employment") {
    let employed = false;
    let businessOwner = false;
    const hasSafaricom = true;

    if (isIdk(input)) {
      employed = false;
      businessOwner = false;
    } else if (["1", "employed", "employee", "job", "working for someone", "ninaajiriwa"].includes(input)) {
      employed = true;
    } else if (["2", "business", "self employed", "self-employed", "own business", "entrepreneur", "biashara"].includes(input)) {
      businessOwner = true;
    } else if (["3", "unemployed", "not employed", "looking for work", "no job", "student"].includes(input)) {
      employed = false;
    } else {
      return { reply: msgs().invalidEmployment(), updates: baseUpdates };
    }

    return advanceStep(
      workingSession,
      "ask_disability",
      { employed, businessOwner, hasSafaricom },
      msgs().askDisability(),
      baseUpdates
    );
  }

  if (step === "ask_disability") {
    let disability;
    if (["1", "yes", "ndio", "ndiyo"].includes(input)) disability = true;
    else if (["2", "no", "hapana"].includes(input)) disability = false;
    else if (isIdk(input)) disability = false;
    else return { reply: msgs().invalidDisability(), updates: baseUpdates };

    return advanceStep(workingSession, "ask_categories", { disability }, msgs().askCategories(), baseUpdates);
  }

  if (step === "ask_categories") {
    let categoriesWanted = [];

    if (isIdk(input) || ["6", "all", "everything", "zote"].includes(input)) {
      categoriesWanted = ["financial", "health", "employment", "legal", "housing"];
    } else {
      const parts = input.split(/[,\s]+/);
      for (const part of parts) {
        const cat = CATEGORY_MAP[part.trim()];
        if (cat && !categoriesWanted.includes(cat)) categoriesWanted.push(cat);
      }
      if (categoriesWanted.length === 0) {
        return {
          reply: msgs().invalidCategories(msgs().askCategories),
          updates: baseUpdates,
        };
      }
    }

    const profile = { ...workingSession.profile, categoriesWanted };
    const matches = matchBenefits(profile);

    if (matches.length === 0) {
      return {
        reply: msgs().noMatches(),
        updates: {
          ...baseUpdates,
          step: "results",
          profile,
          lastMatches: matches,
        },
      };
    }

    return {
      reply: buildResultsMessage(matches.slice(0, 6), workingSession.language),
      updates: {
        ...baseUpdates,
        step: "results",
        profile,
        lastMatches: matches,
      },
    };
  }

  // ── In-application form filling step ────────────────────────
  if (step === "application") {
    return handleApplicationInput(workingSession, text, baseUpdates);
  }

  // ── Post-results / menu fallback ────────────────────────────
  if (step === "results" || step === "menu") {
    return { reply: msgs().unknownInput(), updates: baseUpdates };
  }

  // First contact — show language selection
  return {
    reply: getMessages("en").askLanguage(),
    updates: {
      ...baseUpdates,
      step: "ask_language",
      profile: {},
      lastMatches: [],
    },
  };
}

/**
 * Advances to the next step with updated profile fields.
 */
function advanceStep(session, nextStep, profileFields, reply, baseUpdates) {
  return {
    reply,
    updates: {
      ...baseUpdates,
      step: nextStep,
      profile: { ...session.profile, ...profileFields },
    },
  };
}

/**
 * Returns previous match results if available.
 */
function handleResults(session, baseUpdates) {
  const msgs = getMessages(session.language);
  const matches = session.lastMatches || [];

  if (matches.length === 0) {
    return { reply: msgs.noPreviousResults(), updates: baseUpdates };
  }

  return {
    reply: buildResultsMessage(matches.slice(0, 6), session.language),
    updates: { ...baseUpdates, step: "results" },
  };
}

/**
 * Starts the NEAREST flow or uses profile county.
 */
function handleNearestCommand(session, locationText, baseUpdates) {
  const msgs = getMessages(session.language);
  const matches = session.lastMatches || [];

  if (matches.length === 0) {
    return { reply: msgs.nearestNoMatches(), updates: baseUpdates };
  }

  if (locationText) {
    return handleNearestWithLocation(session, locationText, baseUpdates);
  }

  if (session.profile?.county && session.profile.county !== "Unknown") {
    return handleNearestWithLocation(session, session.profile.county, baseUpdates);
  }

  return {
    reply: msgs.nearestPrompt(),
    updates: { ...baseUpdates, step: "nearest_location" },
  };
}

/**
 * Looks up and formats the nearest office for the user's top benefit.
 */
function handleNearestWithLocation(session, locationText, baseUpdates) {
  const matches = session.lastMatches || [];
  const topBenefit = matches[0].benefit;
  const county = session.profile?.county;

  const result = findNearestOffice(topBenefit.id, county, locationText);
  return {
    reply: formatOfficeMessage(result, topBenefit.name, session.language),
    updates: { ...baseUpdates, step: "results" },
  };
}

/**
 * Quick category browse from the menu step.
 */
function handleCategoryBrowse(session, category, baseUpdates) {
  const msgs = getMessages(session.language);
  const quickProfile = { ...session.profile, categoriesWanted: [category] };
  const matches = matchBenefits(quickProfile);

  if (matches.length === 0) {
    return { reply: msgs.noMatches(), updates: baseUpdates };
  }

  return {
    reply: buildResultsMessage(matches.slice(0, 5), session.language),
    updates: { ...baseUpdates, lastMatches: matches, step: "results" },
  };
}

/**
 * Checks if the user exceeded the message rate limit.
 */
function checkRateLimit(session) {
  const now = Date.now();
  const timestamps = (session.messageTimestamps || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);

  if (timestamps.length > RATE_LIMIT_MAX) {
    return { limited: true, updates: { messageTimestamps: timestamps } };
  }

  return { limited: false, updates: { messageTimestamps: timestamps } };
}

/**
 * Returns true if the input is an "I don't know" response.
 */
function isIdk(input) {
  return IDK_TRIGGERS.includes(input);
}

/**
 * Builds the results summary message with benefit cards.
 */
function buildResultsMessage(matches, lang) {
  const msgs = getMessages(lang);
  const total = matches.length;
  const header = msgs.resultsHeader(total);

  const cards = matches
    .map((m, i) => formatBenefitCard(m, i + 1, lang))
    .join("\n\n─────────────────────\n\n");

  return header + cards + msgs.resultsFooter();
}

/**
 * Formats a single benefit card for results display.
 */
function formatBenefitCard(result, index, lang) {
  const msgs = getMessages(lang);
  const { benefit, reasons } = result;
  const providerLabel = lang === "sw" ? "Mtoa huduma" : "Provider";
  const amountLabel = lang === "sw" ? "Kiasi" : "Amount";

  return (
    `*${index}. ${benefit.emoji} ${benefit.name}*\n` +
    `${providerLabel}: ${benefit.provider}\n` +
    `${amountLabel}: ${benefit.amount}\n` +
    `${msgs.cardReason(reasons)}\n` +
    msgs.cardApply(index)
  );
}

/**
 * Formats full application details for a benefit.
 */
function formatApplicationDetails(benefit, lang) {
  const msgs = getMessages(lang);
  const labels = msgs.detailLabels;

  return (
    `*${benefit.emoji} ${benefit.name}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*${labels.whatYouGet}*\n${benefit.amount}\n\n` +
    `*${labels.about}*\n${benefit.description}\n\n` +
    `*${labels.howToApply}*\n${benefit.howToApply}\n\n` +
    `*${labels.documents}*\n${benefit.documents}\n\n` +
    `*${labels.deadline}* ${benefit.deadline}\n\n` +
    `*${labels.link}* ${benefit.link}\n\n` +
    msgs.detailFooter()
  );
}

// ── Application flow helpers ──────────────────────────────────────

function getActiveBenefit(session) {
  const app = session.application;
  if (!app || !app.benefitId) return null;
  return benefits.find((b) => b.id === app.benefitId) || null;
}

function toResults(session, baseUpdates) {
  const msgs = getMessages(session.language);
  const matches = session.lastMatches || [];
  if (matches.length === 0) {
    return { reply: msgs.menu(), updates: { ...baseUpdates, step: "menu" } };
  }
  return {
    reply: buildResultsMessage(matches.slice(0, 6), session.language),
    updates: { ...baseUpdates, step: "results" },
  };
}

function handleApplyCommand(session, input, baseUpdates) {
  const msgs = getMessages(session.language);
  const matches = session.lastMatches || [];
  const parts = input.split(/\s+/);
  const numStr = parts[1];

  if (matches.length === 0) {
    return toResults(session, baseUpdates);
  }

  // "APPLY" with no number → check if partial in-progress exists
  if (!numStr) {
    const active = getActiveBenefit(session);
    if (active && session.application?.benefitId && Object.keys(session.application.answers || {}).length > 0) {
      const savedCount = Object.keys(session.application.answers).length;
      return {
        reply: msgs.applyResumeBenefit(active.name, savedCount),
        updates: { ...baseUpdates, step: "application_resume_prompt" },
      };
    }
    return toResults(session, baseUpdates);
  }

  // "APPLY N" — start / resume the nth match
  const idx = parseInt(numStr, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= matches.length) {
    return { reply: msgs.invalidApplyCommand(), updates: baseUpdates };
  }
  const benefit = matches[idx].benefit;
  const existing = session.application;
  const hasPartial =
    existing?.benefitId === benefit.id &&
    Object.keys(existing.answers || {}).length > 0;

  if (hasPartial) {
    return startApplication(session, benefit, idx, baseUpdates, /*forceResume*/ true);
  }
  return startApplication(session, benefit, idx, baseUpdates);
}

function startApplication(session, benefit, matchIndex, baseUpdates, forceResume = false) {
  const msgs = getMessages(session.language);
  const form = getFormForBenefit(benefit.id);
  const existing = session.application;
  const hasPartial =
    existing?.benefitId === benefit.id &&
    Object.keys(existing.answers || {}).length > 0;

  // If resuming partial (and not told to start fresh), show resume prompt
  if (hasPartial && !forceResume && session.step !== "application_resume_prompt") {
    const savedCount = Object.keys(existing.answers).length;
    return {
      reply: msgs.applyResumeBenefit(benefit.name, savedCount),
      updates: { ...baseUpdates, step: "application_resume_prompt" },
    };
  }

  let application;
  if (hasPartial && forceResume) {
    // Continue existing
    application = {
      ...existing,
      templateId: form.templateId,
      startedAt: existing.startedAt || Date.now(),
      completedApps: existing.completedApps || [],
    };
  } else {
    // Fresh
    application = {
      benefitId: benefit.id,
      currentFieldIndex: 0,
      templateId: form.templateId,
      answers: {},
      startedAt: Date.now(),
      completedApps: existing?.completedApps || [],
    };
  }

  const intro = msgs.applyNowIntro(benefit.name, form.estimatedMinutes, form.fieldCount);
  const firstQ = buildCurrentFieldQuestion({ ...session, application });
  return {
    reply: intro + "\n\n" + firstQ,
    updates: {
      ...baseUpdates,
      step: "application",
      application,
      lastResultContext: { selectedIndex: matchIndex },
    },
  };
}

function cancelApplication(session, baseUpdates) {
  const msgs = getMessages(session.language);
  const matches = session.lastMatches || [];
  const app = session.application;
  let resumeIndex = null;
  if (app?.benefitId) {
    const idx = matches.findIndex((m) => m.benefit.id === app.benefitId);
    if (idx >= 0) resumeIndex = idx + 1;
  }
  return {
    reply: msgs.applyCancelled(resumeIndex),
    updates: { ...baseUpdates, step: "results" },
  };
}

function backApplicationField(session, baseUpdates) {
  const app = session.application;
  if (!app) return toResults(session, baseUpdates);

  const form = getFormForBenefit(app.benefitId || "any-id");
  const prevIdx = Math.max(0, app.currentFieldIndex - 1);

  // Delete the answer for the current field (so BACK re-enters it)
  const curField = form.fields[app.currentFieldIndex];
  const newAnswers = { ...(app.answers || {}) };
  if (curField) delete newAnswers[curField.key];

  // Also delete the previous field answer we're going back to
  const prevField = form.fields[prevIdx];
  if (prevField) delete newAnswers[prevField.key];

  const newApp = { ...app, currentFieldIndex: prevIdx, answers: newAnswers };
  return {
    reply: buildCurrentFieldQuestion({ ...session, application: newApp }),
    updates: {
      ...baseUpdates,
      step: "application",
      application: newApp,
    },
  };
}

function buildCurrentFieldQuestion(session) {
  const msgs = getMessages(session.language);
  const app = session.application;
  if (!app) return "";
  const form = getFormForBenefit(app.benefitId || "any-id");
  const field = form.fields[app.currentFieldIndex];
  if (!field) return msgs.applyCompleteHeader("Unknown", "FAIDA-NONE");
  const label = getFieldLabel(field, session.language || "en");
  return msgs.applyFieldQuestion(
    label,
    field.placeholder,
    app.currentFieldIndex + 1,
    form.fields.length
  );
}

function handleApplicationInput(session, rawText, baseUpdates) {
  const msgs = getMessages(session.language);
  const app = session.application;
  const lang = session.language || "en";
  if (!app || !app.benefitId) return toResults(session, baseUpdates);

  const form = getFormForBenefit(app.benefitId);
  const fields = form.fields;
  const field = fields[app.currentFieldIndex];
  if (!field) {
    // Complete application
    return completeApplication(session, baseUpdates);
  }

  const input = rawText || "";
  const validation = validateField(field, input, lang);

  if (!validation.valid) {
    return {
      reply: msgs.applyFieldError(validation.error || "Invalid input"),
      updates: baseUpdates,
    };
  }

  const newAnswers = { ...(app.answers || {}) };
  if (!validation.skip && validation.value !== undefined) {
    newAnswers[field.key] = validation.value;
  }

  // Advance field
  let nextIdx = app.currentFieldIndex + 1;

  // Skip optional/skipped fields that have no answer but are last
  while (nextIdx < fields.length) {
    const f = fields[nextIdx];
    // If it's not present and required, stop at it — we need to ask
    break;
  }

  if (nextIdx >= fields.length) {
    // Done! Finish
    const finalApp = { ...app, answers: newAnswers, currentFieldIndex: fields.length };
    return completeApplication({ ...session, application: finalApp }, baseUpdates);
  }

  const advancedApp = {
    ...app,
    answers: newAnswers,
    currentFieldIndex: nextIdx,
  };

  return {
    reply: buildCurrentFieldQuestion({ ...session, application: advancedApp }),
    updates: {
      ...baseUpdates,
      step: "application",
      application: advancedApp,
    },
  };
}

function completeApplication(session, baseUpdates) {
  const msgs = getMessages(session.language);
  const app = session.application;
  const lang = session.language || "en";
  if (!app || !app.benefitId) return toResults(session, baseUpdates);

  const benefit = getActiveBenefit(session);
  if (!benefit) return toResults(session, baseUpdates);

  // Check for user-level cancellation on instant-mobile flow
  const confirmKey = "confirmTerms";
  if (app.answers[confirmKey] === "cancel") {
    const matches = session.lastMatches || [];
    const idx = matches.findIndex((m) => m.benefit.id === app.benefitId);
    const resumeIdx = idx >= 0 ? idx + 1 : null;
    return {
      reply: msgs.applyCancelled(resumeIdx),
      updates: { ...baseUpdates, step: "results" },
    };
  }

  const refCode = generateReferenceCode(app.benefitId, benefit.id.slice(-2));
  const documentBody = formatApplicationDocument(
    benefit,
    app.answers,
    app.templateId || "loans-personal",
    lang,
    refCode
  );

  // Record completion
  const completedApps = [...(app.completedApps || []), {
    benefitId: app.benefitId,
    answers: { ...app.answers },
    completedAt: Date.now(),
    refCode,
  }];

  // Build next-step info (office or mobile)
  let nextStepText = "";
  const isMobileOnly = ["hustler-fund-personal", "sha-registration"].includes(app.benefitId);

  if (isMobileOnly) {
    const dialMap = {
      "hustler-fund-personal": { code: "254", site: "https://hustlerfund.go.ke" },
      "sha-registration": { code: "147", site: "https://sha.go.ke" },
    };
    const d = dialMap[app.benefitId] || { code: "?", site: benefit.link };
    nextStepText = msgs.applyCompleteNextStepsMobile(d.code, d.site);
  } else {
    const county = session.profile?.county || app.answers.county || app.answers.preferredCounty;
    const loc = findNearestOffice(app.benefitId, county, county);
    if (loc && loc.name) {
      nextStepText = msgs.applyCompleteNextStepsOffice(
        loc.name,
        loc.address || "",
        loc.phone || (lang === "sw" ? "Angalia mtandao" : "Check website"),
        loc.hours || (lang === "sw" ? "Jumatatu–Ijumaa, 8am–5pm" : "Mon–Fri, 8am–5pm")
      );
    } else {
      nextStepText = msgs.applyCompleteNextStepsMobile(
        "Dial *USSD* —",
        benefit.link
      );
    }
  }

  const header = msgs.applyCompleteHeader(benefit.name, refCode);
  const docInfo = msgs.applyCompleteDocumentInfo();
  const footer = msgs.applyCompleteFooter();

  const reply = header + docInfo + documentBody + "\n" + nextStepText + footer;

  const resetApp = {
    benefitId: null,
    currentFieldIndex: 0,
    templateId: null,
    answers: {},
    startedAt: null,
    completedApps,
  };

  // Emit log
  try {
    logEvent("application_complete", {
      benefitId: app.benefitId,
      refCode,
      hasOffice: !isMobileOnly,
    });
  } catch (_) {}

  return {
    reply,
    updates: {
      ...baseUpdates,
      step: "results",
      application: resetApp,
    },
  };
}

module.exports = { handleMessage, processMessage };
