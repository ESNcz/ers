import { UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { MainLinksProps } from "@components/layout/LayoutHeader";
import NavigationDropdownItem from "@components/layout/NavigationDropdownItem";
import NavigationItem from "@components/layout/NavigationItem";

interface NavigationItemListProps {
  userRole: UserRole;
  mainLinks: MainLinksProps;
  pathname: string;
  closeDrawer: () => void;
}

const NavigationItemList = ({ userRole, mainLinks, pathname, closeDrawer }: NavigationItemListProps) => {
  return mainLinks.map((item, index) => {
    if ("children" in item) {
      return (
        <NavigationDropdownItem
          key={`dropdown-menu-${index}`}
          userRole={userRole}
          item={item}
          pathname={pathname}
          closeDrawer={closeDrawer}
        />
      );
    }

    return (
      hasSomePermissions(userRole, item.permissions) && (
        <NavigationItem
          key={`main-link-${index}-${item.label}`}
          data-active={pathname === item.link || undefined}
          closeDrawer={closeDrawer}
          item={item}
        />
      )
    );
  });
};

export default NavigationItemList;
