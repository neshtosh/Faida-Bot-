/**
 * Faida Health Check Server
 * ──────────────────────────────────────────────────────────
 * HTTP server for Railway health checks and a shareable WhatsApp
 * QR scan page at /qr when the bot is waiting to be linked.
 */

const http = require("http");
const QRCode = require("qrcode");
const { logger } = require("./logger");

let botStatus = "starting";
let currentQr = null;
let qrGeneratedAt = null;

/**
 * Returns the public base URL for shareable links.
 */
function getPublicBaseUrl() {
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, "");
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

/**
 * Returns the shareable QR scan page URL.
 */
function getQrPageUrl() {
  return `${getPublicBaseUrl()}/qr`;
}

/**
 * Updates the reported bot status for the health endpoint.
 */
function setBotStatus(status) {
  botStatus = status;
}

/**
 * Stores the latest WhatsApp pairing QR string.
 */
function setCurrentQr(qr) {
  currentQr = qr;
  qrGeneratedAt = new Date().toISOString();
}

/**
 * Clears the stored QR after a successful connection.
 */
function clearCurrentQr() {
  currentQr = null;
  qrGeneratedAt = null;
}

/**
 * Builds a mobile-friendly HTML page for scanning the QR code.
 */
function buildQrHtml(dataUrl) {
  const refreshSeconds = botStatus === "awaiting_qr_scan" ? 15 : 0;
  const refreshMeta = refreshSeconds
    ? `<meta http-equiv="refresh" content="${refreshSeconds}">`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Faida — Link WhatsApp</title>
  ${refreshMeta}
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      background: linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 45%, #ffffff 100%);
      color: #14532d;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(20, 83, 45, 0.12);
      padding: 28px 24px;
      text-align: center;
    }
    h1 { margin: 0 0 8px; font-size: 1.5rem; }
    p { margin: 0 0 16px; line-height: 1.5; color: #166534; }
    img {
      width: min(100%, 320px);
      height: auto;
      border-radius: 12px;
      border: 1px solid #bbf7d0;
      background: #fff;
      padding: 12px;
    }
    ol {
      text-align: left;
      margin: 20px auto 0;
      padding-left: 20px;
      color: #166534;
      line-height: 1.6;
    }
    .note {
      margin-top: 18px;
      font-size: 0.92rem;
      color: #15803d;
      background: #f0fdf4;
      border-radius: 10px;
      padding: 12px;
    }
    .status { font-size: 0.85rem; color: #64748b; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌿 Link Faida to WhatsApp</h1>
    <p>Scan this QR code with your phone to connect the bot.</p>
    <img src="${dataUrl}" alt="WhatsApp QR code">
    <ol>
      <li>Open WhatsApp on your phone</li>
      <li>Go to <strong>Settings → Linked Devices → Link a Device</strong></li>
      <li>Point your camera at the QR code above</li>
    </ol>
    <div class="note">QR codes expire in about 60 seconds. This page auto-refreshes with a new one.</div>
    <div class="status">Generated: ${qrGeneratedAt || "just now"}</div>
  </div>
</body>
</html>`;
}

/**
 * Builds the HTML page shown when no QR is available.
 */
function buildQrUnavailableHtml() {
  const message =
    botStatus === "connected"
      ? "WhatsApp is already connected. The bot is live."
      : botStatus === "connecting"
        ? "Connecting… refresh this page in a few seconds."
        : "No QR code is available right now. Restart the bot to generate one.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="5">
  <title>Faida — WhatsApp Link</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, sans-serif;
      background: #f8fafc;
      color: #334155;
      padding: 24px;
    }
    .card {
      max-width: 420px;
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌿 Faida WhatsApp</h1>
    <p>${message}</p>
    <p><small>Status: ${botStatus}</small></p>
  </div>
</body>
</html>`;
}

/**
 * Starts the health check HTTP server on the given port.
 */
function startHealthServer(port) {
  const server = http.createServer(async (req, res) => {
    const path = (req.url || "/").split("?")[0];

    if (path === "/health" || path === "/") {
      const body = JSON.stringify({
        status: "ok",
        service: "faida-bot",
        bot: botStatus,
        qrUrl: currentQr ? getQrPageUrl() : null,
        timestamp: new Date().toISOString(),
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(body);
      return;
    }

    if (path === "/qr") {
      if (!currentQr) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(buildQrUnavailableHtml());
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(currentQr, {
          margin: 2,
          width: 512,
          color: { dark: "#14532d", light: "#ffffff" },
        });
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(buildQrHtml(dataUrl));
      } catch (err) {
        logger.error({ event: "qr_page_error", err: err.message }, "Failed to render QR page");
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Could not generate QR page.");
      }
      return;
    }

    if (path === "/qr.png") {
      if (!currentQr) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("No QR code available.");
        return;
      }

      try {
        const png = await QRCode.toBuffer(currentQr, {
          margin: 2,
          width: 512,
          color: { dark: "#14532d", light: "#ffffff" },
        });
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        });
        res.end(png);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Could not generate QR image.");
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "not_found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    logger.info(
      { event: "health_server", port, qrUrl: getQrPageUrl() },
      "Health check server listening"
    );
  });

  return server;
}

module.exports = {
  startHealthServer,
  setBotStatus,
  setCurrentQr,
  clearCurrentQr,
  getQrPageUrl,
  getPublicBaseUrl,
};
