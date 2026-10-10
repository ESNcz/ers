"use client";

import type { ManualInstallPlatform } from "@/utils/useInstallPrompt";
import { List, Modal, Text, ThemeIcon } from "@mantine/core";
import { IconApps, IconShare2, IconSquarePlus } from "@tabler/icons-react";
import { ReactNode } from "react";

interface InstallInstructionsModalProps {
  platform: ManualInstallPlatform | null;
  opened: boolean;
  onClose: () => void;
}

const INSTRUCTIONS: Record<ManualInstallPlatform, { intro: string; steps: { icon: ReactNode; text: ReactNode }[] }> = {
  ios: {
    intro: "Add Event Registration System to your Home Screen for quick access to your events.",
    steps: [
      {
        icon: <IconShare2 size={16} />,
        text: (
          <>
            Tap the <b>Share</b> button in the Safari toolbar
          </>
        ),
      },
      {
        icon: <IconSquarePlus size={16} />,
        text: (
          <>
            Choose <b>Add to Home Screen</b> and confirm with <b>Add</b>
          </>
        ),
      },
    ],
  },
  macos: {
    intro: "Add Event Registration System to your Dock - it opens in its own window like any other app.",
    steps: [
      {
        icon: <IconShare2 size={16} />,
        text: (
          <>
            Click <b>File</b> in the menu bar, or the <b>Share</b> button in the Safari toolbar
          </>
        ),
      },
      {
        icon: <IconApps size={16} />,
        text: (
          <>
            Choose <b>Add to Dock</b> and confirm with <b>Add</b>
          </>
        ),
      },
    ],
  },
};

/**
 * Safari has no install API, the app has to be added manually from the browser UI
 */
const InstallInstructionsModal = ({ platform, opened, onClose }: InstallInstructionsModalProps) => {
  const instructions = platform ? INSTRUCTIONS[platform] : null;

  return (
    <Modal opened={opened && !!instructions} onClose={onClose} title="Install the app" centered>
      {instructions && (
        <>
          <Text size="sm" mb="md">
            {instructions.intro}
          </Text>
          <List spacing="md" size="sm" center>
            {instructions.steps.map((step, index) => (
              <List.Item
                key={index}
                icon={
                  <ThemeIcon variant="light" radius="xl">
                    {step.icon}
                  </ThemeIcon>
                }
              >
                {step.text}
              </List.Item>
            ))}
          </List>
        </>
      )}
    </Modal>
  );
};

export default InstallInstructionsModal;
