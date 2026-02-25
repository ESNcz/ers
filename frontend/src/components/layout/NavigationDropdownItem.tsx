import { UserRole } from "@/utils/api.schemas";
import { hasSomePermissions } from "@/utils/checkPermissions";
import { GroupedLinks } from "@components/layout/LayoutHeader";
import styles from "@components/layout/LayoutHeader.module.css";
import { Anchor, Box, BoxProps, Button, Menu, NavLink } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { forwardRef, useMemo } from "react";

interface NavigationDropdownItemProps extends BoxProps {
  userRole: UserRole;
  item: GroupedLinks;
  pathname: string;
  closeDrawer: () => void;
}

const NavigationDropdownItem = forwardRef<HTMLDivElement, NavigationDropdownItemProps>(
  ({ userRole, item, pathname, closeDrawer, ...props }, ref) => {
    const dropdownPermission = useMemo(() => {
      return item.children.flatMap((child) => child.permissions).filter((f) => f !== null);
    }, [item]);

    return (
      <Box {...props} ref={ref}>
        {hasSomePermissions(userRole, dropdownPermission) && (
          <Box visibleFrom="sm">
            <Menu shadow="md" trigger="hover" position="bottom-start">
              <Menu.Target>
                <Button
                  component={Anchor}
                  variant="subtle"
                  className={styles.mainLink}
                  data-active={item.children.some((f) => f.link === pathname) || undefined}
                  rightSection={<IconChevronDown />}
                >
                  {item.label}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                {item.children.map((subItem, jIndex) => {
                  return (
                    hasSomePermissions(userRole, subItem.permissions) && (
                      <Menu.Item
                        key={`dropdown-menu-${item.label}-item-${jIndex}`}
                        component={Link}
                        href={subItem.link}
                        classNames={{ item: styles.subLink }}
                        data-active={pathname === subItem.link || undefined}
                      >
                        {subItem.label}
                      </Menu.Item>
                    )
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          </Box>
        )}
        {hasSomePermissions(userRole, dropdownPermission) && (
          <Box hiddenFrom="sm">
            <NavLink
              label={item.label}
              childrenOffset={12}
              className={styles.mainLink}
              data-active={item.children.some((f) => f.link === pathname) || undefined}
              rightSection={<IconChevronRight />}
            >
              {item.children.map((subItem, jIndex) => {
                return (
                  hasSomePermissions(userRole, subItem.permissions) && (
                    <NavLink
                      component={Link}
                      key={`mobile-dropdown-menu-${item.label}-item-${jIndex}`}
                      href={subItem.link}
                      label={subItem.label}
                      classNames={{ root: styles.subLink }}
                      data-active={pathname === subItem.link || undefined}
                      onClick={closeDrawer}
                    />
                  )
                );
              })}
            </NavLink>
          </Box>
        )}
      </Box>
    );
  },
);

NavigationDropdownItem.displayName = "NavigationDropdownItem";

export default NavigationDropdownItem;
