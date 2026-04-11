"use client";

import { useGetCurrentUser, useLogoutUser } from "@/utils/api";
import { RolePermissionsItem } from "@/utils/api.schemas";
import { manageEventLink, manageOrganisationLink, managePeopleLink, settingsLink } from "@/utils/headerLinks";
import routes from "@/utils/routes";
import LogoERS from "@components/icons/LogoERS";
import styles from "@components/layout/LayoutHeader.module.css";
import NavigationItemList from "@components/layout/NavigationItemList";
import {
  Anchor,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Flex,
  Group,
  Menu,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type MainLink = {
  link: string;
  label: string;
  permissions: RolePermissionsItem[] | null;
};

export type GroupedLinks = {
  label: string;
  children: MainLink[];
};

export type MainLinksProps = (MainLink | GroupedLinks)[];

/** Header Links
 *
 * Link from routes
 * Label is text to be displayed
 *
 * Permissions
 * null - anyone has access
 * [] (empty array) - nobody has access, only admins has access
 * others - defined by user role
 *
 * */
const mainLinks: MainLinksProps = [
  { link: routes.DASHBOARD, label: "Home", permissions: null },
  { link: routes.SENT_APPLICATIONS, label: "Sent Applications", permissions: null },
  { link: routes.MY_ORGANISATION, label: "My Organisation", permissions: null },
  {
    label: "Management",
    children: [manageEventLink, manageOrganisationLink, managePeopleLink, settingsLink],
  },
];

const LayoutHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => {
        router.push(routes.LOGIN);
      },
    },
  });

  const { data: currentUser } = useGetCurrentUser();

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <header className={styles.header}>
      <Container size="xl" className={styles.inner}>
        <Anchor component={Link} href={routes.DASHBOARD}>
          <Flex direction="row" justify="center" align="center" gap={8}>
            <LogoERS height={64} width={64} color="primary" />
            <Text size="xl" c="primary" fw="bold" display={{ base: "none", lg: "block" }}>
              Event Registration System
            </Text>
          </Flex>
        </Anchor>

        <Box className={styles.links} visibleFrom="sm">
          <Group gap={0} justify="flex-end">
            {currentUser ? (
              <NavigationItemList
                userRole={currentUser?.role}
                mainLinks={mainLinks}
                pathname={pathname}
                closeDrawer={closeDrawer}
              />
            ) : (
              <Skeleton />
            )}
            {currentUser && (
              <Menu width={260} position="bottom-start" withinPortal>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    p="7px 12px"
                    lh="22px"
                    fs="14px"
                    fw={700}
                    rightSection={<IconChevronDown size={16} stroke={2} />}
                    loading={!currentUser?.email}
                  >
                    {currentUser?.email}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Anchor component={Link} href={routes.ACCOUNT} underline="never" onClick={closeDrawer}>
                    <Menu.Item leftSection={<IconUser size={16} stroke={1.5} />}>Account</Menu.Item>
                  </Anchor>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={16} stroke={1.5} />}
                    onClick={() => {
                      logoutMutation.mutate();
                      closeDrawer();
                    }}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Box>

        <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" hiddenFrom="sm" />
      </Container>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={currentUser?.email}
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Divider my="sm" />

        {currentUser && (
          <Stack gap={4} justify="flex-end">
            <NavigationItemList
              userRole={currentUser?.role}
              mainLinks={mainLinks}
              pathname={pathname}
              closeDrawer={closeDrawer}
            />
          </Stack>
        )}

        <Divider my="sm" />

        <Group justify="center" grow pb="xl" px="md">
          <Button
            component={Link}
            href={routes.ACCOUNT}
            onClick={closeDrawer}
            leftSection={<IconUser size={16} stroke={1.5} />}
          >
            Account
          </Button>
          <Button
            leftSection={<IconLogout size={16} stroke={1.5} />}
            onClick={() => {
              logoutMutation.mutate();
              closeDrawer();
            }}
          >
            Logout
          </Button>
        </Group>

        <Flex direction="row" justify="center" align="center">
          <Text fw={700}>Event Registration System</Text>
        </Flex>
      </Drawer>
    </header>
  );
};

export default LayoutHeader;
