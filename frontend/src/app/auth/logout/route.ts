import routes from "@/utils/routes";
import { NextRequest, NextResponse } from "next/server";

const authCookieName = "AuthCookie";

/**
 * Clears the auth cookie and redirects to login.
 * Used by the logout button and when the API rejects the session (see `getServerCurrentUser`).
 */
export const GET = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL(routes.LOGIN, request.url));
  const expired = "Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly";

  response.headers.append("Set-Cookie", `${authCookieName}=; ${expired}; SameSite=Lax`);
  // Cookies issued before the `/api` rewrite had an explicit domain and were partitioned
  response.headers.append(
    "Set-Cookie",
    `${authCookieName}=; ${expired}; Domain=${request.nextUrl.hostname}; Secure; SameSite=None; Partitioned`,
  );
  response.headers.append(
    "Set-Cookie",
    `${authCookieName}=; ${expired}; Domain=${request.nextUrl.hostname}; Secure; SameSite=None`,
  );

  return response;
};
