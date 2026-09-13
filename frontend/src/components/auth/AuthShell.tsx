"use client";

import routes from "@/utils/routes";
import styles from "@components/auth/AuthShell.module.css";
import LogoERS from "@components/icons/LogoERS";
import { Anchor, Paper, Text, Title } from "@mantine/core";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md";
}

const AuthShell = ({ title, description, children, footer, width = "sm" }: AuthShellProps) => {
  return (
    <main className={styles.shell}>
      <div className={styles.column} data-width={width}>
        <Anchor component={Link} href={routes.LOGIN} className={styles.brand} underline="never">
          <LogoERS width={36} height={36} aria-hidden />
          <span>Event Registration System</span>
        </Anchor>

        <Paper className={styles.panel} p={{ base: "lg", xs: "xl" }}>
          <Title order={1} className={styles.title}>
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm" mt={6}>
              {description}
            </Text>
          )}
          <div className={styles.content}>{children}</div>
        </Paper>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </main>
  );
};

export default AuthShell;
