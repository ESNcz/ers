"use client";

import { useGetCurrentUser, useLogoutUser } from "@/utils/api";
import { RolePermissionsItem } from "@/utils/api.schemas";
import { apiImageURL } from "@/utils/apiImageURL";
import { manageEventLink, manageOrganisationLink, managePeopleLink, settingsLink } from "@/utils/headerLinks";
import routes from "@/utils/routes";
import LogoERS from "@components/icons/LogoERS";
import styles from "@components/layout/LayoutHeader.module.css";
import NavigationItemList from "@components/layout/NavigationItemList";
import {
  Anchor,
  Avatar,
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
  UnstyledButton,
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
  { link: routes.SENT_APPLICATIONS, label: "Sent applications", permissions: null },
  { link: routes.MY_ORGANISATION, label: "My organisation", permissions: null },
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

  const userFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email
    : "";

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <header className={styles.header}>
      <Container size="xl" className={styles.inner}>
        <Anchor component={Link} href={routes.DASHBOARD} className={styles.brand} aria-label="Home">
          <LogoERS height={32} width={32} aria-hidden />
          <Text component="span" className={styles.brandName} display={{ base: "none", lg: "block" }}>
            Event Registration System
          </Text>
        </Anchor>

        <Box className={styles.links} visibleFrom="sm">
          <Group gap={0} wrap="nowrap" justify="flex-end" className={styles.navLinks}>
            {currentUser ? (
              <NavigationItemList
                userRole={currentUser?.role}
                mainLinks={mainLinks}
                pathname={pathname}
                closeDrawer={closeDrawer}
              />
            ) : (
              <Group gap="xs">
                <Skeleton h={16} w={64} />
                <Skeleton h={16} w={120} />
                <Skeleton h={16} w={110} />
              </Group>
            )}
          </Group>
          <Group gap="xs" className={styles.userSection}>
            {currentUser ? (
              <Menu width={260} position="bottom-end" withinPortal>
                <Menu.Target>
                  <UnstyledButton className={styles.user}>
                    <Group gap={8} wrap="nowrap">
                      <Avatar
                        src={currentUser.photo ? apiImageURL(currentUser.photo) : null}
                        name={userFullName}
                        color="initials"
                        alt={userFullName}
                        radius="xl"
                        size={24}
                      />
                      <Text fw={500} size="xs" lh={1}>
                        {userFullName}
                      </Text>
                      <IconChevronDown size={12} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{currentUser.email}</Menu.Label>
                  <Menu.Item
                    component={Link}
                    href={routes.ACCOUNT}
                    leftSection={<IconUser size={16} stroke={1.5} />}
                    onClick={closeDrawer}
                  >
                    Account
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
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
            ) : (
              <Group gap={8}>
                <Skeleton h={24} w={24} circle />
                <Skeleton h={12} w={100} />
              </Group>
            )}
          </Group>
        </Box>

        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          size="sm"
          hiddenFrom="sm"
          aria-label={drawerOpened ? "Close navigation" : "Open navigation"}
        />
      </Container>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          currentUser && (
            <Group gap="sm" wrap="nowrap">
              <Avatar
                src={currentUser.photo ? apiImageURL(currentUser.photo) : null}
                name={userFullName}
                color="initials"
                alt={userFullName}
                radius="xl"
              />
              <Box>
                <Text fw={600} size="sm">
                  {userFullName}
                </Text>
                <Text c="dimmed" size="xs">
                  {currentUser.email}
                </Text>
              </Box>
            </Group>
          )
        }
        hiddenFrom="sm"
      >
        <Divider my="sm" />

        {currentUser && (
          <Stack gap={4} justify="flex-end" className={styles.drawerLinks}>
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
            variant="default"
            component={Link}
            href={routes.ACCOUNT}
            onClick={closeDrawer}
            leftSection={<IconUser size={16} stroke={1.5} />}
          >
            Account
          </Button>
          <Button
            variant="light"
            color="red"
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
          <Text size="sm" c="dimmed">
            Event Registration System
          </Text>
        </Flex>
      </Drawer>
    </header>
  );
};

export default LayoutHeader;
