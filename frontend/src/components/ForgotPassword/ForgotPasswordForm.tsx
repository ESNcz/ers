"use client";

import { useForgotPassword } from "@/utils/api";
import routes from "@/utils/routes";
import { Box, Button, Flex, Text, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useRouter } from "next/navigation";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword({
    mutation: {
      onSuccess: () => {
        router.push(routes.LOGIN);
      },
    },
  });

  const form = useForm<{ email: string }>({
    initialValues: {
      email: "",
    },
    validate: {
      email: isNotEmpty("E-mail can not be empty."),
    },
  });

  const sendRequest = async (values: { email: string }) => {
    forgotPasswordMutation.mutate({ params: { email: values.email } });
  };

  return (
    <Box maw="32rem" w="100%">
      <form onSubmit={form.onSubmit((values) => sendRequest(values))} onReset={form.onReset}>
        <Flex direction="column" gap={12}>
          <TextInput label="Email" {...form.getInputProps("email")} />
        </Flex>
        <Flex direction="column" gap={16} mt={16}>
          <Button loading={forgotPasswordMutation.isPending} type="submit">
            Send reset link
          </Button>
          {/* LOGIN ERROR */}
          {forgotPasswordMutation.isError && (
            <Text c="red" size="sm" role="alert">
              We couldn’t send the reset link. Please try again.
            </Text>
          )}
        </Flex>
      </form>
    </Box>
  );
};

export default ForgotPasswordForm;
