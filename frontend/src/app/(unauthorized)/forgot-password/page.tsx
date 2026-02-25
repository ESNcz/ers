"use client";

import routes from "@/utils/routes";
import ForgotPasswordForm from "@components/ForgotPassword/ForgotPasswordForm";
import { Anchor, Container, Flex, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const ForgotPassword = () => {
  return (
    <Container h="100vh">
      <Flex direction="column" justify="center" align="center" h="100%" gap={8}>
        <Flex direction="column" justify="center" align="center" maw={512} w="100%" gap={16}>
          <Title>Forgot Password</Title>
          <ForgotPasswordForm />
        </Flex>
        <Flex justify="end" w="100%" maw={512}>
          <Anchor component={Link} href={routes.LOGIN} display="flex">
            <IconArrowLeft />
            Back
          </Anchor>
        </Flex>
      </Flex>
    </Container>
  );
};

export default ForgotPassword;
