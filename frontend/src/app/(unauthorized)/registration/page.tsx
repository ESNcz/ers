"use client";

import routes from "@/utils/routes";
import RegistrationForm from "@components/registration/RegistrationForm";
import { Anchor, Container, Flex, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const RegistrationPage = () => {
  return (
    <Container h="100vh">
      <Flex direction="column" justify="center" align="center" h="100%" gap={8}>
        <Flex direction="column" justify="center" align="center" maw={512} w="100%" gap={16}>
          <Title>Register</Title>
          <RegistrationForm />
        </Flex>
        <Flex justify="end" w="100%" maw={512}>
          <Anchor component={Link} href={routes.LOGIN} display="flex">
            <IconArrowRight />
            Login
          </Anchor>
        </Flex>
      </Flex>
    </Container>
  );
};

export default RegistrationPage;
