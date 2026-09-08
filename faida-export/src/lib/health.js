/**
 * Faida Health Check Server
 * ──────────────────────────────────────────────────────────
 * Simple HTTP server for Railway and other platforms to verify
 * the bot process is running. Responds 200 OK on /health.
 */

const http = require("http");
const { logger } = require("./logger");

let botStatus = "starting";

/**
 * Updates the reported bot status for the health endpoint.
 */
function setBotStatus(status) {
  botStatus = status;
}

/**
 * Starts the health check HTTP server on the given port.
 */
function startHealthServer(port) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      const body = JSON.stringify({
        status: "ok",
        service: "faida-bot",
        bot: botStatus,
        timestamp: new Date().toISOString(),
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(body);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "not_found" }));
  });

  server.listen(port, "0.0.0.0", () => {
    logger.info({ event: "health_server", port }, "Health check server listening");
  });

  return server;
}

module.exports = { startHealthServer, setBotStatus };
