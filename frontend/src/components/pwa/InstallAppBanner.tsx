"use client";

import { useInstallPrompt } from "@/utils/useInstallPrompt";
import LogoERS from "@components/icons/LogoERS";
import styles from "@components/pwa/InstallAppBanner.module.css";
import InstallInstructionsModal from "@components/pwa/InstallInstructionsModal";
import { Button, CloseButton, Group, Paper, Text, Transition } from "@mantine/core";
import { useDisclosure, useLocalStorage, useTimeout } from "@mantine/hooks";
import { useEffect, useState } from "react";

const DISMISSED_STORAGE_KEY = "ers-install-banner-dismissed-at";
/** Banner shows again after this time when dismissed - 24 hours */
const SNOOZE_MS = 24 * 60 * 60 * 1000;
/** Do not interrupt the user right after the page loads, lets success notifications (bottom-right) close first */
const SHOW_DELAY_MS = 6000;

/**
 * Promotes installing the app - native prompt on Chromium, Home Screen instructions on iOS
 */
const InstallAppBanner = () => {
  const { isAvailable, manualInstall, promptInstall } = useInstallPrompt();
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>({
    key: DISMISSED_STORAGE_KEY,
    defaultValue: null,
    getInitialValueInEffect: true,
  });
  const [isDelayOver, setIsDelayOver] = useState(false);
  const [instructionsOpened, { open: openInstructions, close: closeInstructions }] = useDisclosure(false);

  const { start } = useTimeout(() => setIsDelayOver(true), SHOW_DELAY_MS);
  useEffect(start, [start]);

  const isSnoozed = dismissedAt !== null && Date.now() - dismissedAt < SNOOZE_MS;
  const isVisible = isAvailable && isDelayOver && !isSnoozed;

  const dismiss = () => setDismissedAt(Date.now());

  const install = async () => {
    if (manualInstall) {
      openInstructions();
      return;
    }
    // Dismissed native prompt can't be shown again until the browser fires a new event
    if (!(await promptInstall())) dismiss();
  };

  return (
    <>
      <Transition mounted={isVisible && !instructionsOpened} transition="slide-up" duration={250}>
        {(transitionStyles) => (
          <Paper
            className={styles.banner}
            style={transitionStyles}
            shadow="lg"
            radius="md"
            p="md"
            withBorder
            role="dialog"
            aria-label="Install the app"
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <LogoERS height={40} width={40} aria-hidden />
              <div style={{ flex: 1 }}>
                <Text fw={600} size="sm">
                  Install Event Registration System
                </Text>
                <Text c="dimmed" size="xs" mt={2}>
                  Open your events in one tap, right from your {manualInstall === "macos" ? "Dock" : "home screen"}.
                </Text>
                <Group gap="xs" mt="sm">
                  <Button size="xs" onClick={install}>
                    Install
                  </Button>
                  <Button size="xs" variant="subtle" color="gray" onClick={dismiss}>
                    Not now
                  </Button>
                </Group>
              </div>
              <CloseButton size="sm" onClick={dismiss} aria-label="Close" />
            </Group>
          </Paper>
        )}
      </Transition>
      <InstallInstructionsModal
        platform={manualInstall}
        opened={instructionsOpened}
        onClose={() => {
          closeInstructions();
          dismiss();
        }}
      />
    </>
  );
};

export default InstallAppBanner;
