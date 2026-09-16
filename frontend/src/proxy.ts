import { getGetInitialisedQueryKey } from "@/utils/api";
import { SERVER_API_URL } from "@/utils/customInstance";
import { absoluteUrl, isTokenUsable } from "@/utils/middleware-helper";
import { routes } from "@/utils/routes";
import { NextRequest, NextResponse } from "next/server";

const notAuthorizedPaths = [
  routes.LOGIN,
  routes.REGISTER,
  routes.INIT,
  routes.VERIFY,
  routes.FORGOT_PASSWORD,
  routes.RESET_PASSWORD,
];

const apiUrl = SERVER_API_URL;
const initCookieName = "InitFlag";
const authCookieName = "AuthCookie";

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Logout must always be reachable, it clears the auth cookie
  if (pathname === routes.LOGOUT) return NextResponse.next();

  const isNonProtectedPath = notAuthorizedPaths.includes(pathname);

  let isInitialised = request.cookies.get(initCookieName)?.value === "1";

  if (!isInitialised) {
    try {
      const initResponse = await fetch(`${apiUrl}${getGetInitialisedQueryKey()[0]}`, {
        method: "GET",
      });
      const data = await initResponse.json();
      isInitialised = !!data?.isInitialised;
    } catch (err) {
      console.error(`${apiUrl}${getGetInitialisedQueryKey()[0]}`);
      console.error("[INIT] Failed to check init status:", err);
    }
  }

  // Handle init page access rules
  if (!isInitialised && pathname !== routes.INIT) {
    return NextResponse.redirect(absoluteUrl(request, routes.INIT));
  }
  if (isInitialised && pathname === routes.INIT) {
    return NextResponse.redirect(absoluteUrl(request, routes.LOGIN));
  }

  // Step 2: Optimistic authentication check (malformed/expired token), the API does the real verification
  const token = request.cookies.get(authCookieName)?.value;
  const verifiedToken = isTokenUsable(token);

  // If token exists but unusable -> clear (incl. legacy cookies) & go to login
  if (token && !verifiedToken) {
    return NextResponse.redirect(absoluteUrl(request, routes.LOGOUT));
  }

  // If token valid & user is on public-only page -> go to dashboard
  if (verifiedToken && isNonProtectedPath) {
    return NextResponse.redirect(absoluteUrl(request, routes.DASHBOARD));
  }

  // If no token & protected page -> go to login
  if (!verifiedToken && !isNonProtectedPath) {
    return NextResponse.redirect(absoluteUrl(request, routes.LOGIN));
  }

  // Otherwise -> allow
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|public|favicon.*|manifest|icons/*).*)"],
};
