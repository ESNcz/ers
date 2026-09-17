import { getCurrentUser } from "@/utils/api";
import routes from "@/utils/routes";
import { isAxiosError } from "axios";
import { redirect } from "next/navigation";
import { cache } from "react";

// Deduplicated per request - layouts calling this share one API call
export const getServerCurrentUser = cache(async () => {
  try {
    return await getCurrentUser();
  } catch (error) {
    // Token revoked, user deleted or signature invalid. Cookies can't be modified while rendering,
    // so the logout route handler clears it.
    if (isAxiosError(error) && error.response?.status === 401) redirect(routes.LOGOUT);
    throw error;
  }
});
