import { getCurrentUser } from "@/utils/api";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { manageOrganisationLink } from "@/utils/headerLinks";
import routes from "@/utils/routes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ManageEventsLayoutProps {
  children: ReactNode;
}

const ManageEventsLayout = async ({ children }: ManageEventsLayoutProps) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("AuthCookie");
  const currentUser = await getCurrentUser({
    headers: {
      Authorization: `Bearer ${token?.value}`,
    },
  });

  if (!hasSomePermissions(currentUser.role, manageOrganisationLink.permissions)) redirect(routes.DASHBOARD);

  return children;
};

export default ManageEventsLayout;
