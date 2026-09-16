import type { CookieOptions, Response } from "express";

import { isProduction } from "utilities/env";

export const AUTH_COOKIE = "AuthCookie";
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1_000; // 7 days in milliseconds

/**
 * API is served under the web domain (Next.js rewrites `/api/*`), so the cookie is first-party:
 * host-only (no `domain`) and `sameSite: "lax"` which blocks it on cross-site requests (CSRF).
 */
const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export const setAuthCookie = (response: Response, token: string) => {
  clearLegacyAuthCookie(response);
  response.cookie(AUTH_COOKIE, token, { ...authCookieOptions, maxAge: AUTH_COOKIE_MAX_AGE });
};

export const clearAuthCookie = (response: Response) => {
  clearLegacyAuthCookie(response);
  response.clearCookie(AUTH_COOKIE, authCookieOptions);
};

/**
 * Cookies issued before the API moved behind the web domain were set with an explicit `domain`,
 * `sameSite: "none"` and `partitioned`. They must be cleared with matching attributes.
 */
const clearLegacyAuthCookie = (response: Response) => {
  const domain = isProduction ? process.env.WEB_DOMAIN?.split("https://")[1] : "localhost";
  if (!domain) return;

  response.clearCookie(AUTH_COOKIE, {
    domain,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: isProduction,
    path: "/",
  });
};
