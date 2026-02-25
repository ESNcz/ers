"use client";

import { useResetPassword } from "@/utils/api";
import { ResetPasswordDto } from "@/utils/api.schemas";
import routes from "@/utils/routes";
import { Box, Button, Flex, PasswordInput, Text } from "@mantine/core";
import { Form, isNotEmpty, useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type ResetPasswordForm = ResetPasswordDto & {
  confirmPassword: string;
};
const ForgotPasswordForm = () => {
  const pathname = useSearchParams();
  const token = pathname.get("token");
  const router = useRouter();

  const resetPasswordMutation = useResetPassword({
    mutation: {
      onSuccess: () => {
        router.push(routes.LOGIN);
      },
    },
  });

  const form = useForm<ResetPasswordForm>({
    initialValues: {
      token: token ?? "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      token: isNotEmpty("Field can not be empty."),
      password: isNotEmpty("Field can not be empty."),
      confirmPassword: (value, values) => (values.password === value ? null : "Password does not match"),
    },
  });

  if (!token) return <Text c="red">Something went wrong! Please try again.</Text>;

  const sendRequest = async (values: ResetPasswordDto) => {
    resetPasswordMutation.mutate({ data: { token: token, password: values.password } });
  };

  return (
    <Box maw="32rem" w="100%">
      <Form form={form} onSubmit={(values) => sendRequest(values)}>
        <Flex direction="column" gap={12}>
          <PasswordInput label="Password" type="password" {...form.getInputProps("password")} required />
          <PasswordInput label="Confirm Password" type="password" {...form.getInputProps("confirmPassword")} required />
        </Flex>
        <Flex direction="column" gap={16} mt={16}>
          <Button loading={resetPasswordMutation.isPending} type="submit">
            Send Request
          </Button>
          {/* Token or mutation ERROR */}
          {!token || (resetPasswordMutation.isError && <Text c="red">Something went wrong! Please try again.</Text>)}
        </Flex>
      </Form>
    </Box>
  );
};

export default ForgotPasswordForm;
