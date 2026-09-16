import { getCurrentUser } from "@/utils/api";
import routes from "@/utils/routes";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

// Deduplicated per request - layouts calling this share one API call
export const getServerCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("AuthCookie");

  try {
    return await getCurrentUser({
      headers: {
        Authorization: `Bearer ${token?.value}`,
      },
    });
  } catch (error) {
    // Token revoked, user deleted or signature invalid. Cookies can't be modified while rendering,
    // so the logout route handler clears it.
    if (isAxiosError(error) && error.response?.status === 401) redirect(routes.LOGOUT);
    throw error;
  }
});
