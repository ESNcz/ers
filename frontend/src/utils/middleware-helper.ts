import { decodeJwt } from "jose";
import { NextRequest } from "next/server";

export const absoluteUrl = (request: NextRequest, path: string) => new URL(path, request.url).toString();

/**
 * Optimistic check only - the signature is NOT verified here (the frontend has no signing secret).
 * The API verifies the token on every request, see `getServerCurrentUser`.
 */
export const isTokenUsable = (token: string | undefined) => {
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return !exp || exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
