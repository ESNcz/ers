import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export const absoluteUrl = (request: NextRequest, path: string) => new URL(path, request.url).toString();

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("The environment variable JWT_SECRET is not set.");
  }
  return secret;
};

export async function verifyJwtToken(token: string | undefined) {
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecretKey()));
    return verified.payload;
  } catch (error) {
    return null;
  }
}
