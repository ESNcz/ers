"use client";

import routes from "@/utils/routes";
import Icon404 from "@components/icons/Icon404";
import styles from "@components/layout/ErrorPage.module.css";
import { Button, Center, Flex, Group, Text, Title } from "@mantine/core";
import Link from "next/link";

const Error = () => {
  return (
    <Center>
      <Icon404 className={styles.image} />

      <Flex direction="column" justify="center" align="center" className={styles.textBlock}>
        <Title className={styles.title}>Nothing to see here</Title>
        <Text c="dimmed" size="lg" ta="center" className={styles.description}>
          Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to
          another URL. If you think this is an error contact support.
        </Text>
        <Group justify="center">
          <Button component={Link} href={routes.DASHBOARD} size="md">
            Take me back to home page
          </Button>
        </Group>
      </Flex>
    </Center>
  );
};

export default Error;
