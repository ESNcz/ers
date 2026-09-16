"use client";

import routes from "@/utils/routes";
import PasswordResetForm from "@components/ForgotPassword/PasswordResetForm";
import AuthShell from "@components/auth/AuthShell";
import { Anchor } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const ResetPassword = () => {
  return (
    <AuthShell
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <Anchor component={Link} href={routes.LOGIN} size="sm">
          <IconArrowLeft size={16} />
          Back to log in
        </Anchor>
      }
    >
      <PasswordResetForm />
    </AuthShell>
  );
};

export default ResetPassword;
