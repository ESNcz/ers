import { getCurrentUser } from "@/utils/api";
import { cookies } from "next/headers";
import { cache } from "react";

// Deduplicated per request - layouts calling this share one API call
export const getServerCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("AuthCookie");
  return getCurrentUser({
    headers: {
      Authorization: `Bearer ${token?.value}`,
    },
  });
});
