import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkPassword,
  createSessionToken,
  isAuthConfigured,
} from "@/lib/auth";

/** Only allow same-site relative redirects after login. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/admin";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const next = safeNext(form.get("next"));
  const password = String(form.get("password") || "");

  if (!isAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=config", req.url), 303);
  }

  if (!(await checkPassword(password))) {
    // Slow down guessing
    await new Promise((r) => setTimeout(r, 1000));
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "invalid");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
