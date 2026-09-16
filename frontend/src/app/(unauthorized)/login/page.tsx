"use client";

import routes from "@/utils/routes";
import AuthShell from "@components/auth/AuthShell";
import LoginForm from "@components/auth/LoginForm";
import { Anchor, Text } from "@mantine/core";
import Link from "next/link";

const LoginPage = () => {
  return (
    <AuthShell
      title="Log in"
      description="Use your e-mail or username to continue."
      footer={
        <>
          <Anchor component={Link} href={routes.FORGOT_PASSWORD} size="sm">
            Forgot password?
          </Anchor>
          <Text size="sm" c="dimmed">
            New here?{" "}
            <Anchor component={Link} href={routes.REGISTER} size="sm" fw={600}>
              Create an account
            </Anchor>
          </Text>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
};

export default LoginPage;
