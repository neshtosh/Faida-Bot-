/**
 * Faida Verified Web Fetch
 * ──────────────────────────────────────────────────────────
 * Fetches pages from allowlisted domains and extracts form fields
 * and readable text for the AI form assistant.
 */

const { isVerifiedUrl } = require("./sources");
const { logger } = require("./logger");

const FETCH_TIMEOUT_MS = 20000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_TEXT_CHARS = 6000;

/**
 * Strips HTML to plain text.
 */
function htmlToText(html) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts the page title from HTML.
 */
function extractTitle(html) {
  return htmlToText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").slice(0, 200);
}

/**
 * Parses HTML form fields into a normalized list.
 */
function extractForms(html) {
  const forms = [];
  const formBlocks = html.match(/<form[\s\S]*?<\/form>/gi) || [];

  for (const block of formBlocks) {
    const action = block.match(/action=["']([^"']+)["']/i)?.[1] || "";
    const method = (block.match(/method=["']([^"']+)["']/i)?.[1] || "GET").toUpperCase();
    const fields = [];

    const inputRegex = /<input[^>]*>/gi;
    let match;
    while ((match = inputRegex.exec(block))) {
      const tag = match[0];
      const type = (tag.match(/type=["']([^"']+)["']/i)?.[1] || "text").toLowerCase();
      if (["hidden", "submit", "button", "image", "reset"].includes(type)) continue;

      const name = tag.match(/name=["']([^"']+)["']/i)?.[1];
      if (!name) continue;

      fields.push({
        key: name,
        label: tag.match(/placeholder=["']([^"']+)["']/i)?.[1] || name.replace(/[_-]+/g, " "),
        type: type === "email" ? "email" : type === "tel" ? "phone" : type === "number" ? "number" : "text",
        required: /\srequired(\s|>|=)/i.test(tag),
      });
    }

    const textareaRegex = /<textarea[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/textarea>/gi;
    while ((match = textareaRegex.exec(block))) {
      fields.push({
        key: match[1],
        label: match[1].replace(/[_-]+/g, " "),
        type: "text",
        required: /\srequired(\s|>|=)/i.test(match[0]),
      });
    }

    const selectRegex = /<select[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi;
    while ((match = selectRegex.exec(block))) {
      const options = [...match[2].matchAll(/<option[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi)].map(
        (o) => ({ value: o[1], label: htmlToText(o[2]) })
      );
      fields.push({
        key: match[1],
        label: match[1].replace(/[_-]+/g, " "),
        type: "select",
        options,
        required: /\srequired(\s|>|=)/i.test(match[0]),
      });
    }

    if (fields.length > 0) {
      forms.push({ action, method, fields });
    }
  }

  return forms;
}

/**
 * Builds a deduplicated field list from all forms on a page.
 */
function mergeFormFields(forms) {
  const merged = [];
  const seen = new Set();

  for (const form of forms) {
    for (const field of form.fields) {
      if (seen.has(field.key)) continue;
      seen.add(field.key);
      merged.push(field);
    }
  }

  return merged;
}

/**
 * Fetches a verified URL and returns page metadata.
 */
async function fetchVerifiedPage(urlString) {
  if (!isVerifiedUrl(urlString)) {
    throw new Error("URL is not from a verified source");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(urlString, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FaidaBot/1.0 (Kenya benefits assistant)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      throw new Error("Page too large to process");
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const title = extractTitle(html);
    const text = htmlToText(html).slice(0, MAX_TEXT_CHARS);
    const forms = extractForms(html);
    const fields = mergeFormFields(forms);
    const primaryForm = forms[0] || null;

    logger.info(
      { event: "verified_page_fetched", url: urlString, fieldCount: fields.length },
      "Verified page fetched"
    );

    return {
      url: urlString,
      title: title || urlString,
      text,
      forms,
      fields,
      submitAction: primaryForm?.action || null,
      submitMethod: primaryForm?.method || "GET",
    };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  fetchVerifiedPage,
  extractForms,
  htmlToText,
  mergeFormFields,
};
