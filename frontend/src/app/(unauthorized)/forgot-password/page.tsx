"use client";

import routes from "@/utils/routes";
import ForgotPasswordForm from "@components/ForgotPassword/ForgotPasswordForm";
import AuthShell from "@components/auth/AuthShell";
import { Anchor } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const ForgotPassword = () => {
  return (
    <AuthShell
      title="Forgot password"
      description="Enter your e-mail and we will send you a link to reset your password."
      footer={
        <Anchor component={Link} href={routes.LOGIN} size="sm">
          <IconArrowLeft size={16} />
          Back to log in
        </Anchor>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
};

export default ForgotPassword;
