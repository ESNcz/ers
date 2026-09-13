"use client";

import { useGetSettings } from "@/utils/api";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import styles from "@components/layout/LayoutFooter.module.css";
import { Anchor, Container, Flex, Group, Skeleton } from "@mantine/core";
import Link from "next/link";
import React from "react";

const LayoutFooter = () => {
  const { data: settingsData } = useGetSettings();

  if (!settingsData)
    return (
      <footer className={styles.footer}>
        <Container size="xl">
          <Skeleton height={16} width="40%" />
        </Container>
      </footer>
    );

  return (
    <footer className={styles.footer}>
      <Container size="xl">
        <Group justify="space-between" align="center" gap="md">
          <Flex justify="start" align="center" gap={32} flex={1} miw={0}>
            <RichTextRenderer content={settingsData?.footerDescription} />
          </Flex>
          <Flex justify="end" align="center" gap={24} wrap="wrap">
            {settingsData.termsAndConditions && (
              <Anchor
                component={Link}
                href={settingsData.termsAndConditions}
                size="sm"
                target="_blank"
                className={styles.legalLink}
              >
                Terms and conditions
              </Anchor>
            )}
            {settingsData.privacyPolicy && (
              <Anchor
                component={Link}
                href={settingsData.privacyPolicy}
                size="sm"
                target="_blank"
                className={styles.legalLink}
              >
                Privacy policy
              </Anchor>
            )}
          </Flex>
        </Group>
      </Container>
    </footer>
  );
};

export default LayoutFooter;
