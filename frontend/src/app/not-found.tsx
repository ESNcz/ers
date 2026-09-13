"use client";

import routes from "@/utils/routes";
import Icon404 from "@components/icons/Icon404";
import styles from "@components/layout/ErrorPage.module.css";
import { Anchor, Button, Group, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Error = () => {
  const router = useRouter();

  return (
    <main className={styles.root}>
      <Icon404 className={styles.image} aria-hidden />

      <div className={styles.textBlock}>
        <Text className={styles.eyebrow}>Error 404</Text>
        <Title className={styles.title}>This page doesn’t exist</Title>
        <Text c="dimmed" size="lg" ta="center" className={styles.description}>
          The address may be mistyped, or the page was moved. If you followed a link inside the app, let your section
          coordinator know.
        </Text>
        <Group justify="center" gap="md">
          <Button component={Link} href={routes.DASHBOARD} size="md">
            Go to events
          </Button>
          <Anchor component="button" type="button" onClick={() => router.back()} size="sm" className={styles.back}>
            <IconArrowLeft size={16} />
            Previous page
          </Anchor>
        </Group>
      </div>
    </main>
  );
};

export default Error;
