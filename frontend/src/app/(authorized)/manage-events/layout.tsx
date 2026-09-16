import { hasSomePermissions } from "@/utils/checkPermissions";
import { getServerCurrentUser } from "@/utils/getServerCurrentUser";
import { manageEventLink } from "@/utils/headerLinks";
import routes from "@/utils/routes";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface ManageEventsLayoutProps {
  children: ReactNode;
}

const ManageEventsLayout = async ({ children }: ManageEventsLayoutProps) => {
  const currentUser = await getServerCurrentUser();

  if (!hasSomePermissions(currentUser?.role, manageEventLink.permissions)) redirect(routes.DASHBOARD);

  return children;
};

export default ManageEventsLayout;
