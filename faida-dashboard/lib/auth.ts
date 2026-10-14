/**
 * Admin session auth — a single shared ADMIN_PASSWORD and an HMAC-signed
 * session cookie. Uses Web Crypto so it runs in both middleware (Edge)
 * and route handlers (Node).
 */

export const SESSION_COOKIE = "faida_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

/** Returns true when an admin password is configured. */
export function isAuthConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;
}

function signingSecret(): string {
  // Rotating ADMIN_PASSWORD (or setting ADMIN_SESSION_SECRET) logs everyone out.
  return process.env.ADMIN_SESSION_SECRET || `faida-admin:${process.env.ADMIN_PASSWORD || ""}`;
}

async function hmacHex(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checks a submitted password against ADMIN_PASSWORD. */
export async function checkPassword(candidate: string): Promise<boolean> {
  if (!isAuthConfigured()) return false;
  // Compare HMACs so the comparison length doesn't depend on the input
  const [a, b] = await Promise.all([
    hmacHex(`pw:${candidate}`),
    hmacHex(`pw:${process.env.ADMIN_PASSWORD}`),
  ]);
  return safeEqual(a, b);
}

/** Creates a signed session token: "<expiresAtSeconds>.<hmac>". */
export async function createSessionToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${await hmacHex(`session:${expires}`)}`;
}

/** Returns true if the token is correctly signed and not expired. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !isAuthConfigured()) return false;
  const [expiresStr, sig] = token.split(".");
  const expires = Number(expiresStr);
  if (!sig || !Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  return safeEqual(sig, await hmacHex(`session:${expires}`));
}
