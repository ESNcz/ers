"use client";

import routes from "@/utils/routes";
import AuthShell from "@components/auth/AuthShell";
import RegistrationForm from "@components/registration/RegistrationForm";
import { Anchor, Text } from "@mantine/core";
import Link from "next/link";

const RegistrationPage = () => {
  return (
    <AuthShell
      title="Create an account"
      description="You need an account to apply for events."
      width="md"
      footer={
        <Text size="sm" c="dimmed">
          Already registered?{" "}
          <Anchor component={Link} href={routes.LOGIN} size="sm" fw={600}>
            Log in
          </Anchor>
        </Text>
      }
    >
      <RegistrationForm />
    </AuthShell>
  );
};

export default RegistrationPage;
