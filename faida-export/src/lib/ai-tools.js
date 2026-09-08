/**
 * Faida AI Tools
 * ──────────────────────────────────────────────────────────
 * Tool definitions and executors for the AI agent — verified web
 * search, page fetch, and form assistance starters.
 */

const { searchVerifiedCatalog, searchAndFetch } = require("./websearch");
const { fetchVerifiedPage } = require("./webfetch");
const { isVerifiedUrl } = require("./sources");

const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_verified_catalog",
      description:
        "Search Faida's verified database of Kenyan grants, benefits, and live opportunities (including M-Taji partner listings).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What the user is looking for, e.g. youth grant Nairobi" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_verified_page",
      description:
        "Fetch readable content and form fields from a verified official URL (.go.ke, m-taji.co.ke, etc.).",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Full HTTPS URL from a verified domain" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_form_assistance",
      description:
        "Start helping the user fill a form from a verified URL. Use when they want to apply or need form help.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Verified form or application page URL" },
        },
        required: ["url"],
      },
    },
  },
];

/**
 * Executes an AI tool call and returns a string result for the model.
 */
async function executeAiTool(name, args) {
  if (name === "search_verified_catalog") {
    const results = searchVerifiedCatalog(args.query || "", 6);
    if (results.length === 0) {
      return JSON.stringify({ found: 0, message: "No verified matches. Suggest OPPORTUNITIES or MENU." });
    }
    return JSON.stringify({ found: results.length, results });
  }

  if (name === "fetch_verified_page") {
    const url = args.url || "";
    if (!isVerifiedUrl(url)) {
      return JSON.stringify({ error: "URL not verified. Only official partner/government domains allowed." });
    }
    const page = await fetchVerifiedPage(url);
    return JSON.stringify({
      title: page.title,
      url: page.url,
      fieldCount: page.fields.length,
      fields: page.fields.slice(0, 15).map((f) => ({ key: f.key, label: f.label, required: f.required })),
      excerpt: page.text.slice(0, 2000),
    });
  }

  if (name === "start_form_assistance") {
    const url = args.url || "";
    if (!isVerifiedUrl(url)) {
      return JSON.stringify({ error: "Cannot start form help for unverified URL." });
    }
    return JSON.stringify({
      action: "start_web_form",
      url,
      message: "Form assistance will begin. User should answer each question. They can type PDF or SUBMIT when done.",
    });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

/**
 * Runs catalog search plus optional page fetch for richer AI context.
 */
async function researchVerifiedTopic(query) {
  return searchAndFetch(query, true);
}

module.exports = { OPENAI_TOOLS, executeAiTool, researchVerifiedTopic };
