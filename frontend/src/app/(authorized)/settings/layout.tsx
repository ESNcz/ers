import { hasSomePermissions } from "@/utils/checkPermissions";
import { getServerCurrentUser } from "@/utils/getServerCurrentUser";
import { settingsLink } from "@/utils/headerLinks";
import routes from "@/utils/routes";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout = async ({ children }: SettingsLayoutProps) => {
  const currentUser = await getServerCurrentUser();

  if (!hasSomePermissions(currentUser.role, settingsLink.permissions)) redirect(routes.DASHBOARD);

  return children;
};

export default SettingsLayout;
