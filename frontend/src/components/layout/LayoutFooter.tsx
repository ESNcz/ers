"use client";

import { useGetSettings } from "@/utils/api";
import RichTextRenderer from "@components/Richtext/RichTextRenderer";
import styles from "@components/layout/LayoutFooter.module.css";
import { Anchor, Container, Flex, Group, Skeleton } from "@mantine/core";
import Link from "next/link";
import React from "react";

const LayoutFooter = () => {
  const { data: settingsData } = useGetSettings();

  if (!settingsData) return <Skeleton height={50} className={styles.footer} />;

  return (
    <footer className={styles.footer}>
      <Container size="xl">
        <Group>
          <Flex justify="start" align="center" gap={32} flex={1}>
            <RichTextRenderer content={settingsData?.footerDescription} />
          </Flex>
          <Flex justify="end" align="center" gap={32}>
            {settingsData.termsAndConditions && (
              <Anchor component={Link} href={settingsData.termsAndConditions} c="gray" size="sm" target="_blank">
                Terms and Conditions
              </Anchor>
            )}
            {settingsData.privacyPolicy && (
              <Anchor component={Link} href={settingsData.privacyPolicy} c="gray" size="sm" target="_blank">
                Privacy Policy
              </Anchor>
            )}
          </Flex>
        </Group>
      </Container>
    </footer>
  );
};

export default LayoutFooter;
