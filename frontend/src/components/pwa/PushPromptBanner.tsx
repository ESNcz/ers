"use client";

import { useGetPushPublicKey } from "@/utils/api";
import { showPushErrorNotification } from "@/utils/notifications";
import { enablePushNotifications, getPushSubscription, usePushSupport } from "@/utils/pushNotifications";
import routes from "@/utils/routes";
import styles from "@components/pwa/PushPromptBanner.module.css";
import { Button, CloseButton, Group, Paper, Text, ThemeIcon, Transition } from "@mantine/core";
import { useLocalStorage, useTimeout } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBell } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const DISMISSED_STORAGE_KEY = "ers-push-banner-dismissed-at";
/** Banner shows again after this time when dismissed - 7 days */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
/** Do not interrupt the user right after the page loads, lets success notifications (bottom-right) close first */
const SHOW_DELAY_MS = 6000;

// Whether the banner is going to show - InstallAppBanner waits until this is resolved, one prompt at a time
let isPromptPending = false;
const pendingListeners = new Set<() => void>();
const setPromptPending = (pending: boolean) => {
  if (pending === isPromptPending) return;
  isPromptPending = pending;
  pendingListeners.forEach((listener) => listener());
};
const subscribePending = (listener: () => void) => {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
};

/** Push prompt goes first after login, other prompts wait for it */
export const usePushPromptPending = () =>
  useSyncExternalStore(
    subscribePending,
    () => isPromptPending,
    () => false,
  );

/**
 * Soft prompt for push notifications - the browser permission prompt opens only after the user accepts here,
 * so it always comes from a click (required by Safari/iOS and Firefox) and is not rejected out of surprise.
 * Turns on all notification types, choosing individual types is TODO (see backend/TODO.md).
 */
const PushPromptBanner = () => {
  const pathname = usePathname();
  const { data: publicKeyData } = useGetPushPublicKey();
  const { isSupported, browserPermission } = usePushSupport();

  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>({
    key: DISMISSED_STORAGE_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });

  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDelayOver, setIsDelayOver] = useState(false);
  // Snooze is compared against the load time - dismissing in this visit is always "snoozed"
  const [loadedAt] = useState(() => Date.now());

  const { start } = useTimeout(() => setIsDelayOver(true), SHOW_DELAY_MS);
  useEffect(start, [start]);

  useEffect(() => {
    if (!isSupported) return;
    getPushSubscription()
      .then((subscription) => setIsSubscribed(!!subscription))
      .catch(() => setIsSubscribed(false));
  }, [isSupported]);

  const isSnoozed = dismissedAt !== null && loadedAt - dismissedAt < SNOOZE_MS;

  // Everything but the delay - known well before the delay ends, so the install banner never flashes first
  const isPending =
    !!publicKeyData?.publicKey &&
    isSupported &&
    // Blocked permission can't be asked again, only changed in browser settings
    browserPermission !== "denied" &&
    isSubscribed === false &&
    !isSnoozed &&
    // Account page has its own switch
    pathname !== routes.ACCOUNT;
  const isVisible = isPending && isDelayOver;

  useEffect(() => {
    setPromptPending(isPending);
    return () => setPromptPending(false);
  }, [isPending]);

  const dismiss = () => setDismissedAt(Date.now());

  const enable = async () => {
    setIsEnabling(true);
    try {
      const permission = await enablePushNotifications();
      if (permission === "granted") {
        setIsSubscribed(true);
        notifications.show({
          title: "Notifications are on",
          message: "You can turn them off on your Account page.",
          color: "green",
        });
      } else {
        // Closed or blocked the browser prompt
        dismiss();
      }
    } catch (error) {
      showPushErrorNotification(error);
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Transition mounted={isVisible} transition="slide-down" duration={250}>
      {(transitionStyles) => (
        <Paper
          className={styles.banner}
          style={transitionStyles}
          shadow="lg"
          radius="md"
          p="md"
          withBorder
          role="dialog"
          aria-label="Turn on notifications"
        >
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon variant="light" radius="xl" size={40} aria-hidden>
              <IconBell size={22} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text fw={600} size="sm">
                Turn on notifications
              </Text>
              <Text c="dimmed" size="xs" mt={2}>
                Get notified about your events, for example when you receive a sugar cube.
              </Text>
              <Group gap="xs" mt="sm">
                <Button size="xs" onClick={enable} loading={isEnabling}>
                  Turn on
                </Button>
                <Button size="xs" variant="subtle" color="gray" onClick={dismiss} disabled={isEnabling}>
                  Not now
                </Button>
              </Group>
            </div>
            <CloseButton size="sm" onClick={dismiss} disabled={isEnabling} aria-label="Close" />
          </Group>
        </Paper>
      )}
    </Transition>
  );
};

export default PushPromptBanner;
