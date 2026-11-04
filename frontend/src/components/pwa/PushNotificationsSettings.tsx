"use client";

import { sendTestPush, useGetPushPublicKey } from "@/utils/api";
import { showPushErrorNotification } from "@/utils/notifications";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushSubscription,
  usePushSupport,
} from "@/utils/pushNotifications";
import { useInstallPrompt } from "@/utils/useInstallPrompt";
import InstallInstructionsModal from "@components/pwa/InstallInstructionsModal";
import NotificationPreferences from "@components/pwa/NotificationPreferences";
import { Alert, Button, Divider, Group, Paper, Stack, Switch, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBell, IconBellOff } from "@tabler/icons-react";
import { useEffect, useState } from "react";

/**
 * Turn Web Push notifications on/off for this device
 */
const PushNotificationsSettings = () => {
  const { data: publicKeyData, isLoading: isKeyLoading } = useGetPushPublicKey();
  const { manualInstall, isInstalled } = useInstallPrompt();
  const [instructionsOpened, { open: openInstructions, close: closeInstructions }] = useDisclosure(false);

  const { isSupported, browserPermission } = usePushSupport();
  // Updated after the permission prompt, the browser fires no event for it
  const [promptedPermission, setPermission] = useState<NotificationPermission | null>(null);
  const permission = promptedPermission ?? browserPermission;
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    getPushSubscription()
      .then((subscription) => setIsSubscribed(!!subscription))
      .catch(() => setIsSubscribed(false));
  }, [isSupported]);

  // Push is disabled on the server
  if (isKeyLoading || !publicKeyData?.publicKey) return null;

  const enable = async () => {
    setIsPending(true);
    try {
      const result = await enablePushNotifications();
      setPermission(result);
      setIsSubscribed(result === "granted");
    } catch (error) {
      showPushErrorNotification(error);
    } finally {
      setIsPending(false);
    }
  };

  const disable = async () => {
    setIsPending(true);
    try {
      await disablePushNotifications();
      setIsSubscribed(false);
    } catch (error) {
      showPushErrorNotification(error);
    } finally {
      setIsPending(false);
    }
  };

  const sendTest = async () => {
    try {
      await sendTestPush();
      notifications.show({ title: "Test notification sent", message: "It should arrive in a few seconds." });
    } catch (error) {
      showPushErrorNotification(error);
    }
  };

  const renderContent = () => {
    // iOS/iPadOS exposes Web Push only to the app installed to the Home Screen
    if (manualInstall === "ios" && !isInstalled) {
      return (
        <Alert variant="light" icon={<IconBell size={18} />} title="Install the app first">
          <Text size="sm">On iPhone and iPad, notifications work only in the app added to your Home Screen.</Text>
          <Button size="xs" mt="sm" onClick={openInstructions}>
            How to install
          </Button>
        </Alert>
      );
    }

    if (!isSupported) {
      return (
        <Text size="sm" c="dimmed">
          This browser does not support notifications.
        </Text>
      );
    }

    if (permission === "denied") {
      return (
        <Alert variant="light" color="orange" icon={<IconBellOff size={18} />} title="Notifications are blocked">
          <Text size="sm">
            Allow notifications for this site in your browser or system settings, then reload the page.
          </Text>
        </Alert>
      );
    }

    return (
      <Stack gap="sm">
        <Switch
          label="Notifications on this device"
          description="For example when you receive a sugar cube"
          checked={!!isSubscribed}
          disabled={isSubscribed === null || isPending}
          onChange={(event) => (event.currentTarget.checked ? enable() : disable())}
        />
        {isSubscribed && (
          <Group>
            <Button size="xs" variant="light" onClick={sendTest}>
              Send test notification
            </Button>
          </Group>
        )}
      </Stack>
    );
  };

  return (
    <Paper withBorder radius="md" p="md" mt="xl">
      <Text fw={600} mb="sm">
        Push notifications
      </Text>
      {renderContent()}
      {/* Saved per user, so other devices can be set from here too */}
      <Divider my="md" />
      <NotificationPreferences />
      <InstallInstructionsModal platform="ios" opened={instructionsOpened} onClose={closeInstructions} />
    </Paper>
  );
};

export default PushNotificationsSettings;
